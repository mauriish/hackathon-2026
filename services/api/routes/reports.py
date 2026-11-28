"""Recepción segura de reportes confirmados."""

from __future__ import annotations

import hashlib
import hmac
import importlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import RLock
from typing import Literal
from urllib.parse import quote, urlencode, urlsplit, urlunsplit
from urllib.request import Request as UrlRequest, urlopen
from uuid import uuid4

from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from psycopg import Error as DatabaseError

from app.config import Settings, get_settings
from database.models import ReportRecord, ReportStatus
from database.repository import connect, create_report
from reports.sanitization import sanitize_text

_REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
# La API se ejecuta desde services/api; añade la raíz para usar el paquete
# antiabuso público del monorepo sin copiar ni modificar su implementación.
if str(_REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPOSITORY_ROOT))

_anti_abuse = importlib.import_module("packages.security.anti-abuse")
router = APIRouter()


def configure_report_state(app: FastAPI) -> None:
    """Inicializa controles de proceso; la persistencia sigue en PostgreSQL."""
    app.state.report_rate_limiter = _anti_abuse.RateLimiter()
    app.state.report_deduplicator = _anti_abuse.InMemoryFingerprintStore()
    app.state.report_lock = RLock()


class SubmissionTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["app", "link"]
    value: str = Field(min_length=1)


class ReportSubmission(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contract_type: Literal["ReportSubmission"]
    target: SubmissionTarget
    message: str = Field(min_length=1)
    context: str
    turnstile_token: str = Field(min_length=1)


def _error(
    status_code: int,
    code: str,
    message: str,
    *,
    retryable: bool = False,
    provider: str | None = None,
    retry_after: int | None = None,
) -> Response:
    body: dict[str, object] = {
        "contract_type": "ApiError",
        "code": code,
        "message": message,
        "retryable": retryable,
    }
    if provider is not None:
        body["provider"] = provider
    headers = {"Retry-After": str(retry_after)} if retry_after is not None else None
    return JSONResponse(status_code=status_code, content=body, headers=headers)


def _sanitize_target(target: SubmissionTarget) -> SubmissionTarget:
    value = target.value.strip()
    if target.kind == "link":
        parsed = urlsplit(value if "://" in value else f"https://{value}")
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or any(char.isspace() for char in parsed.hostname)
        ):
            raise ValueError("Destino link inválido")
        host = parsed.hostname
        if ":" in host:
            host = f"[{host}]"
        if parsed.port is not None:
            host = f"{host}:{parsed.port}"
        path = quote(sanitize_text(parsed.path), safe="/%:@-._~")
        sanitized = urlunsplit((parsed.scheme, host, path, "", ""))
        return SubmissionTarget(kind="link", value=sanitized)
    sanitized = sanitize_text(value)
    if not sanitized:
        raise ValueError("Destino app inválido")
    return SubmissionTarget(kind="app", value=sanitized)


def _verify_turnstile(token: str, secret: str) -> bool:
    request = UrlRequest(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data=urlencode({"secret": secret, "response": token}).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=5) as response:
            result = json.loads(response.read())
    except Exception as exc:
        # Los errores de transporte o respuestas malformadas nunca validan el token.
        raise _anti_abuse.TurnstileUnavailableError from exc
    return isinstance(result, dict) and result.get("success") is True


def _abuse_id(client_host: str, secret: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"), client_host.encode("utf-8"), hashlib.sha256
    )
    return digest.hexdigest()


def _settings_error(settings: Settings) -> Response | None:
    if (
        settings.abuse_hmac_secret is None
        or len(settings.abuse_hmac_secret.get_secret_value()) < 32
        or not settings.abuse_hmac_secret.get_secret_value().strip()
        or settings.turnstile_secret_key is None
        or not settings.turnstile_secret_key.get_secret_value().strip()
    ):
        return _error(
            503,
            "provider_unavailable",
            "La recepción de reportes no está configurada.",
            retryable=True,
        )
    if not settings.database_url or not settings.database_url.strip():
        return _error(
            503,
            "provider_unavailable",
            "La persistencia de reportes no está disponible.",
            retryable=True,
        )
    return None


@router.post("/reports", status_code=202, tags=["reports"])
def receive_report(request: Request, payload: ReportSubmission) -> Response:
    """Valida, sanea y guarda un reporte sin publicarlo."""
    settings = get_settings()
    unavailable = _settings_error(settings)
    if unavailable is not None:
        return unavailable

    try:
        target = _sanitize_target(payload.target)
    except (ValueError, TypeError):
        return _error(400, "invalid_report", "El reporte contiene datos inválidos.")

    client_host = request.client.host if request.client else ""
    if not client_host:
        return _error(400, "invalid_report", "No se pudo validar el origen.")

    assert settings.abuse_hmac_secret is not None
    assert settings.turnstile_secret_key is not None
    abuse_id = _abuse_id(
        client_host, settings.abuse_hmac_secret.get_secret_value()
    )
    limiter = request.app.state.report_rate_limiter
    with request.app.state.report_lock:
        decision = _anti_abuse.evaluate_request(
            limiter=limiter,
            identity=abuse_id,
            endpoint="reports",
            verifier=_anti_abuse.TurnstileVerifier(
                lambda supplied_token: _verify_turnstile(
                    supplied_token, settings.turnstile_secret_key.get_secret_value()
                )
            ),
            token=payload.turnstile_token,
        )
    if not decision.allowed:
        if decision.code == "rate_limited":
            return _error(
                429,
                "rate_limited",
                "Se alcanzó el límite temporal de envíos.",
                retryable=True,
                retry_after=decision.retry_after_seconds,
            )
        if decision.code == "turnstile_unavailable":
            return _error(
                503,
                "turnstile_unavailable",
                "No fue posible validar Turnstile.",
                retryable=True,
                provider="turnstile",
            )
        return _error(
            400,
            "turnstile_rejected",
            "La verificación Turnstile fue rechazada.",
            provider="turnstile",
        )

    sanitized_message = sanitize_text(payload.message)
    sanitized_context = sanitize_text(payload.context)
    if not sanitized_message:
        return _error(400, "invalid_report", "El mensaje no contiene texto válido.")

    target = _sanitize_target(target)
    deduplicator = request.app.state.report_deduplicator
    fingerprint = _anti_abuse.compute_fingerprint(
        target_kind=target.kind,
        target_value=target.value,
        sanitized_message=sanitized_message,
        sanitized_context=sanitized_context,
    )
    with request.app.state.report_lock:
        if deduplicator.contains(fingerprint):
            return Response(status_code=202)

        now = datetime.now(timezone.utc)
        record = ReportRecord(
            contract_type="ReportRecord",
            report_id=uuid4(),
            created_at=now,
            target=target.model_dump(),
            sanitized_message=sanitized_message,
            sanitized_context=sanitized_context,
            abuse_id=abuse_id,
            abuse_id_expires_at=now + timedelta(days=14),
            status=ReportStatus.RECEIVED,
        )
        try:
            with connect(settings.database_url) as connection:
                create_report(connection, record)
        except (DatabaseError, OSError, ValueError):
            return _error(
                503,
                "provider_unavailable",
                "No fue posible guardar el reporte.",
                retryable=True,
            )

        deduplicator.add(fingerprint)
    return Response(status_code=202)
