"""Pruebas del ciclo periódico de purga."""

import asyncio

import pytest

import database.maintenance as maintenance


def test_periodic_purge_runs_immediately_and_retries_after_failure(
    monkeypatch,
) -> None:
    calls: list[str] = []
    delays: list[int] = []

    def fake_purge(database_url: str) -> int:
        calls.append(database_url)
        if len(calls) == 2:
            raise RuntimeError("base temporalmente no disponible")
        return 1

    async def fake_sleep(seconds: int) -> None:
        delays.append(seconds)
        if len(delays) == 3:
            raise asyncio.CancelledError

    monkeypatch.setattr(maintenance, "_purge_expired_identifiers", fake_purge)
    monkeypatch.setattr(maintenance.asyncio, "sleep", fake_sleep)

    with pytest.raises(asyncio.CancelledError):
        asyncio.run(
            maintenance.run_periodic_expired_abuse_purge(
                "postgresql://test"
            )
        )

    assert calls == ["postgresql://test"] * 3
    assert delays == [
        maintenance.PURGE_INTERVAL_SECONDS,
        maintenance.PURGE_RETRY_SECONDS,
        maintenance.PURGE_INTERVAL_SECONDS,
    ]
