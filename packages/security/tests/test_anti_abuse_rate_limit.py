"""Pruebas unitarias del límite de frecuencia antiabuso."""

import importlib
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

anti_abuse = importlib.import_module("packages.security.anti-abuse")

RateLimiter = anti_abuse.RateLimiter
evaluate_request = anti_abuse.evaluate_request
TurnstileVerifier = anti_abuse.TurnstileVerifier


class FakeClock:
    """Reloj determinista controlado por cada prueba."""

    def __init__(self, now: float = 0.0) -> None:
        self.now = now

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def test_la_politica_por_defecto_es_veinte_solicitudes_en_sesenta_segundos():
    limiter = RateLimiter()

    assert limiter.max_requests == 20
    assert limiter.window_seconds == 60


def test_permite_solicitudes_dentro_del_limite():
    limiter = RateLimiter(max_requests=3, clock=FakeClock())

    decisions = [
        limiter.check(identity="opaco-a", endpoint="/reports") for _ in range(3)
    ]

    assert all(decision.allowed for decision in decisions)
    assert all(decision.code is None for decision in decisions)


def test_rechaza_la_solicitud_siguiente_al_superar_el_limite():
    limiter = RateLimiter(max_requests=2, clock=FakeClock())

    limiter.check(identity="opaco-a", endpoint="/reports")
    limiter.check(identity="opaco-a", endpoint="/reports")
    denied = limiter.check(identity="opaco-a", endpoint="/reports")

    assert not denied.allowed


def test_devuelve_429_y_tiempo_de_reintento_al_superar_el_limite():
    clock = FakeClock()
    limiter = RateLimiter(clock=clock)

    for _ in range(20):
        assert limiter.check(identity="opaco-a", endpoint="/analyze").allowed

    clock.advance(30)
    denied = limiter.check(identity="opaco-a", endpoint="/analyze")

    assert denied.status_code == 429
    assert denied.code == "rate_limited"
    assert 1 <= denied.retry_after_seconds <= 30


def test_reinicia_la_ventana_despues_de_sesenta_segundos():
    clock = FakeClock()
    limiter = RateLimiter(clock=clock)

    for _ in range(20):
        assert limiter.check(identity="opaco-a", endpoint="/reports").allowed

    clock.advance(59)
    assert not limiter.check(identity="opaco-a", endpoint="/reports").allowed

    clock.advance(1)
    assert limiter.check(identity="opaco-a", endpoint="/reports").allowed


def test_separa_los_limites_por_identidad_y_endpoint():
    limiter = RateLimiter(max_requests=1, clock=FakeClock())

    assert limiter.check(identity="opaco-a", endpoint="/reports").allowed
    assert not limiter.check(identity="opaco-a", endpoint="/reports").allowed
    assert limiter.check(identity="opaco-b", endpoint="/reports").allowed
    assert limiter.check(identity="opaco-a", endpoint="/analyze").allowed


def test_el_limite_maximo_es_configurable():
    limiter = RateLimiter(max_requests=4, clock=FakeClock())

    assert sum(
        limiter.check(identity="opaco-a", endpoint="/reports").allowed
        for _ in range(4)
    ) == 4
    assert not limiter.check(identity="opaco-a", endpoint="/reports").allowed


def test_no_solicita_captcha_al_superar_el_limite():
    clock = FakeClock()
    limiter = RateLimiter(max_requests=1, clock=clock)
    verified_tokens: list[str] = []

    def verify(token: str) -> bool:
        verified_tokens.append(token)
        return True

    verifier = TurnstileVerifier(verify)

    first = evaluate_request(
        limiter=limiter,
        identity="opaco-a",
        endpoint="/reports",
        verifier=verifier,
        token="token-valido",
    )
    denied = evaluate_request(
        limiter=limiter,
        identity="opaco-a",
        endpoint="/reports",
        verifier=verifier,
        token="token-valido",
    )

    assert first.allowed
    assert verified_tokens == ["token-valido"]
    assert not denied.allowed
    assert denied.code == "rate_limited"
    assert denied.status_code == 429
    assert denied.retryable
    assert verified_tokens == ["token-valido"]


@pytest.mark.parametrize(
    ("identity", "endpoint"),
    [("", "/reports"), ("opaco-a", ""), (None, "/reports")],
)
def test_rechaza_identidad_o_endpoint_invalidos(identity, endpoint):
    limiter = RateLimiter(clock=FakeClock())

    with pytest.raises(ValueError):
        limiter.check(identity=identity, endpoint=endpoint)
