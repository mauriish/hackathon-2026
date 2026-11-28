"""Pruebas del endpoint de salud."""

from contextlib import nullcontext
from urllib.parse import parse_qs

from fastapi.testclient import TestClient
from pydantic import SecretStr
import pytest

from app.config import Settings
from app.main import app
from routes import reports


def test_health_returns_ok() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def setup_report_dependencies(
    monkeypatch: pytest.MonkeyPatch, *, settings: Settings | None = None
) -> None:
    settings = settings or Settings(
        database_url="postgresql://unused",
        abuse_hmac_secret=SecretStr("test-hmac-secret-with-at-least-32-bytes"),
        turnstile_secret_key=SecretStr("test-turnstile-secret"),
    )
    monkeypatch.setattr(reports, "get_settings", lambda: settings)
    monkeypatch.setattr(reports, "_verify_turnstile", lambda token, secret: True)
    reports.configure_report_state(app)


def test_report_submission_is_sanitized_and_stored_as_pending(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    stored = []
    monkeypatch.setattr(reports, "connect", lambda _: nullcontext(object()))
    monkeypatch.setattr(
        reports, "create_report", lambda connection, record: stored.append(record)
    )
    payload = {
        "contract_type": "ReportSubmission",
        "target": {
            "kind": "link",
            "value": "https://example.invalid/path?session=private#fragment",
        },
        "message": (
            "Contacta a correo persona@example.invalid; nombre: Ana Pérez. "
            "Enlace https://evil.invalid/track?access_token=private#secret"
        ),
        "context": "Recibido en un canal público.",
        "turnstile_token": "temporary-turnstile-token",
    }

    response = TestClient(app).post("/reports", json=payload)

    assert response.status_code == 202
    assert response.content == b""
    assert len(stored) == 1
    record = stored[0]
    assert record.status.value == "received"
    assert record.target.value == "https://example.invalid/path"
    assert "persona@example.invalid" not in record.sanitized_message
    assert "Ana Pérez" not in record.sanitized_message
    assert "access_token" not in record.sanitized_message
    assert "secret" not in record.sanitized_message
    assert record.abuse_id != "testclient"
    assert len(record.abuse_id) == 64
    assert "temporary-turnstile-token" not in repr(record)


def test_invalid_report_is_rejected_before_external_checks(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    called = []
    monkeypatch.setattr(
        reports, "_verify_turnstile", lambda token, secret: called.append(token) or True
    )
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "link", "value": "https://example.invalid"},
        "message": "",
        "context": "",
        "turnstile_token": "token",
    }

    response = TestClient(app).post("/reports", json=payload)

    assert response.status_code == 400
    assert response.json()["code"] == "invalid_report"
    assert called == []


def test_report_rejects_unknown_contract_fields(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "app", "value": "Demo"},
        "message": "Mensaje",
        "context": "",
        "turnstile_token": "token",
        "confirmed": False,
    }

    response = TestClient(app).post("/reports", json=payload)

    assert response.status_code == 400
    assert response.json()["code"] == "invalid_report"


def test_missing_secrets_fail_closed(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch, settings=Settings(database_url="postgresql://unused"))

    response = TestClient(app).post(
        "/reports",
        json={
            "contract_type": "ReportSubmission",
            "target": {"kind": "app", "value": "Demo"},
            "message": "Mensaje",
            "context": "",
            "turnstile_token": "token",
        },
    )

    assert response.status_code == 503
    assert response.json()["code"] == "provider_unavailable"


def test_duplicate_report_is_acknowledged_but_not_persisted(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    stored = []
    monkeypatch.setattr(reports, "connect", lambda _: nullcontext(object()))
    monkeypatch.setattr(
        reports, "create_report", lambda connection, record: stored.append(record)
    )
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "app", "value": "Demo"},
        "message": "Mensaje repetido",
        "context": "",
        "turnstile_token": "token",
    }
    client = TestClient(app)

    first = client.post("/reports", json=payload)
    second = client.post("/reports", json=payload)

    assert first.status_code == second.status_code == 202
    assert len(stored) == 1


def test_turnstile_rejection_does_not_persist_report(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    stored = []
    monkeypatch.setattr(reports, "connect", lambda _: nullcontext(object()))
    monkeypatch.setattr(
        reports, "create_report", lambda connection, record: stored.append(record)
    )
    monkeypatch.setattr(reports, "_verify_turnstile", lambda token, secret: False)
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "app", "value": "Demo"},
        "message": "Mensaje",
        "context": "",
        "turnstile_token": "invalid",
    }

    response = TestClient(app).post("/reports", json=payload)

    assert response.status_code == 400
    assert response.json()["code"] == "turnstile_rejected"
    assert stored == []


def test_turnstile_unavailability_fails_closed(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)

    def unavailable(token: str, secret: str) -> bool:
        raise reports._anti_abuse.TurnstileUnavailableError

    monkeypatch.setattr(reports, "_verify_turnstile", unavailable)
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "app", "value": "Demo"},
        "message": "Mensaje",
        "context": "",
        "turnstile_token": "token",
    }

    response = TestClient(app).post("/reports", json=payload)

    assert response.status_code == 503
    assert response.json()["code"] == "turnstile_unavailable"
    assert response.json()["retryable"] is True


def test_turnstile_verifier_posts_secret_and_token(monkeypatch) -> None:
    class SuccessfulResponse:
        def __enter__(self):
            return self

        def __exit__(self, *args) -> None:
            return None

        def read(self) -> bytes:
            return b'{"success": true}'

    def fake_urlopen(request, *, timeout):
        assert request.full_url == (
            "https://challenges.cloudflare.com/turnstile/v0/siteverify"
        )
        assert parse_qs(request.data.decode()) == {
            "secret": ["private-server-secret"],
            "response": ["one-time-token"],
        }
        assert timeout == 5
        return SuccessfulResponse()

    monkeypatch.setattr(reports, "urlopen", fake_urlopen)

    assert reports._verify_turnstile("one-time-token", "private-server-secret")


def test_rate_limit_returns_retry_after(monkeypatch) -> None:
    setup_report_dependencies(monkeypatch)
    app.state.report_rate_limiter = reports._anti_abuse.RateLimiter(
        max_requests=1, window_seconds=60
    )
    payload = {
        "contract_type": "ReportSubmission",
        "target": {"kind": "app", "value": "Demo"},
        "message": "Primer mensaje",
        "context": "",
        "turnstile_token": "token",
    }
    monkeypatch.setattr(reports, "connect", lambda _: nullcontext(object()))
    monkeypatch.setattr(reports, "create_report", lambda connection, record: None)
    client = TestClient(app)

    assert client.post("/reports", json=payload).status_code == 202
    payload["message"] = "Segundo mensaje"
    response = client.post("/reports", json=payload)

    assert response.status_code == 429
    assert response.json()["code"] == "rate_limited"
    assert int(response.headers["Retry-After"]) >= 1
