"""Consulta de reputación a Google Safe Browsing sin bloquear al consumidor.

Solo se envía la URL normalizada (sin consulta ni fragmento) al proveedor
autorizado. No se navega el destino, no se envía el mensaje original ni se
incluyen identificadores, direcciones IP ni credenciales en la petición.
"""

from __future__ import annotations

import hashlib
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from typing import Any

from ..identity import normalize_url
from .models import PROVIDER, ReputationResult, ReputationStatus

__all__ = ["SafeBrowsingClient", "check_url"]

_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
_CLIENT_ID = "hackathon-2026"
_CLIENT_VERSION = "1.0"
_TIMEOUT = 5.0
_THREAT_TYPES = (
    "MALWARE",
    "SOCIAL_ENGINEERING",
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
)


def _api_error(code: str, message: str, retryable: bool) -> dict[str, Any]:
    """Construye un `ApiError` válido según el contrato v1."""

    return {
        "contract_type": "ApiError",
        "code": code,
        "message": message,
        "retryable": retryable,
        "provider": PROVIDER,
    }


def _unavailable(
    normalized_url: str | None, message: str, code: str, retryable: bool
) -> ReputationResult:
    """Devuelve un estado no disponible sin lanzar hacia el consumidor."""

    return ReputationResult(
        status=ReputationStatus.UNAVAILABLE,
        normalized_url=normalized_url,
        description=message,
        provider_status={
            "provider": PROVIDER,
            "status": "unavailable",
            "error": _api_error(code, message, retryable),
        },
    )


def _available(
    normalized_url: str, status: ReputationStatus, description: str
) -> ReputationResult:
    """Devuelve evidencia saneada y el proveedor como disponible."""

    evidence_id = hashlib.sha256(normalized_url.encode("utf-8")).hexdigest()[:12]
    return ReputationResult(
        status=status,
        normalized_url=normalized_url,
        description=description,
        evidence=(
            {
                "evidence_id": f"gsb-{evidence_id}",
                "source": PROVIDER,
                "description": description,
            },
        ),
        provider_status={"provider": PROVIDER, "status": "available"},
    )


def _build_request(normalized_url: str, api_key: str) -> urllib.request.Request:
    body = {
        "client": {"clientId": _CLIENT_ID, "clientVersion": _CLIENT_VERSION},
        "threatInfo": {
            "threatTypes": list(_THREAT_TYPES),
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": normalized_url}],
        },
    }
    url = f"{_API_URL}?key={urllib.parse.quote(api_key, safe='')}"
    return urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )


class SafeBrowsingClient:
    """Cliente acotado al proveedor de reputación acordado para H26-37."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        timeout: float = _TIMEOUT,
        opener: Callable[..., Any] | None = None,
    ) -> None:
        self._api_key = api_key
        self._timeout = timeout
        self._opener = opener if opener is not None else urllib.request.urlopen

    def check(self, value: str) -> ReputationResult:
        """Consulta la reputación de una URL y nunca propaga fallos de red."""

        normalized_url = normalize_url(value)
        if normalized_url is None:
            return _unavailable(
                None,
                "La URL no es válida; no se realizó la consulta.",
                "invalid_report",
                False,
            )

        api_key = self._api_key or os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY")
        if not api_key:
            return _unavailable(
                normalized_url,
                "La fuente de reputación no está configurada.",
                "provider_unavailable",
                False,
            )

        request = _build_request(normalized_url, api_key)
        try:
            with self._opener(request, timeout=self._timeout) as response:
                http_status = getattr(response, "status", 200)
                if isinstance(http_status, int) and http_status >= 400:
                    return _unavailable(
                        normalized_url,
                        "La fuente de reputación no está disponible.",
                        "provider_unavailable",
                        http_status >= 500,
                    )
                raw = response.read()
        except TimeoutError:
            return _unavailable(
                normalized_url,
                "La fuente de reputación tardó demasiado en responder.",
                "provider_unavailable",
                True,
            )
        except urllib.error.HTTPError as exc:
            return _unavailable(
                normalized_url,
                "La fuente de reputación rechazó la consulta.",
                "provider_unavailable",
                exc.code >= 500,
            )
        except (urllib.error.URLError, OSError):
            return _unavailable(
                normalized_url,
                "La fuente de reputación no está disponible.",
                "provider_unavailable",
                True,
            )

        try:
            payload = json.loads(raw)
        except (json.JSONDecodeError, UnicodeDecodeError, TypeError):
            return _unavailable(
                normalized_url,
                "La fuente de reputación devolvió una respuesta inválida.",
                "provider_invalid_response",
                False,
            )

        if not isinstance(payload, dict):
            return _unavailable(
                normalized_url,
                "La fuente de reputación devolvió una respuesta inválida.",
                "provider_invalid_response",
                False,
            )

        matches = payload.get("matches", [])
        if not isinstance(matches, list):
            return _unavailable(
                normalized_url,
                "La fuente de reputación devolvió una respuesta inválida.",
                "provider_invalid_response",
                False,
            )

        if any(
            isinstance(item, dict) and item.get("threatType") for item in matches
        ):
            return _available(
                normalized_url,
                ReputationStatus.THREAT,
                "Google Safe Browsing reportó el destino como sospechoso.",
            )

        return _available(
            normalized_url,
            ReputationStatus.NO_THREAT,
            "Google Safe Browsing no encontró coincidencias para el destino consultado.",
        )


def check_url(
    value: str,
    *,
    api_key: str | None = None,
    timeout: float = _TIMEOUT,
    opener: Callable[..., Any] | None = None,
) -> ReputationResult:
    """Atajo para consultar una URL con la configuración indicada."""

    return SafeBrowsingClient(
        api_key=api_key, timeout=timeout, opener=opener
    ).check(value)
