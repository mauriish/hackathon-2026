"""Pruebas del arranque, la configuración y health check."""

import asyncio
import threading

from fastapi.testclient import TestClient

import app.main as app_module
from app.main import app


def test_health_returns_ok() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_expired_identifier_purger_starts_and_stops_with_api(
    monkeypatch,
) -> None:
    started = threading.Event()
    stopped = threading.Event()
    database_url = "postgresql://test"

    async def fake_purger(url: str) -> None:
        assert url == database_url
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            stopped.set()

    monkeypatch.setenv("API_DATABASE_URL", database_url)
    monkeypatch.setattr(
        app_module,
        "run_periodic_expired_abuse_purge",
        fake_purger,
    )

    with TestClient(app):
        assert started.wait(timeout=3)

    assert stopped.wait(timeout=3)


def test_expired_identifier_purger_is_disabled_without_database_url(
    monkeypatch,
) -> None:
    started = threading.Event()

    async def fake_purger(_: str) -> None:
        started.set()

    monkeypatch.delenv("API_DATABASE_URL", raising=False)
    monkeypatch.setattr(
        app_module,
        "run_periodic_expired_abuse_purge",
        fake_purger,
    )

    with TestClient(app):
        assert not started.wait(timeout=0.1)
