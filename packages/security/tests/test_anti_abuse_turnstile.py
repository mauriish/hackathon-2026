"""Pruebas unitarias de la verificación fail-closed de Turnstile."""

import importlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

anti_abuse = importlib.import_module("packages.security.anti-abuse")

RateLimiter = anti_abuse.RateLimiter
TurnstileUnavailableError = anti_abuse.TurnstileUnavailableError
TurnstileVerifier = anti_abuse.TurnstileVerifier
evaluate_request = anti_abuse.evaluate_request


class FakeClock:
    def __call__(self) -> float:
        return 0.0


def test_acepta_un_token_valido():
    verifier = TurnstileVerifier(lambda token: True)

    result = verifier.verify("token-valido")

    assert result.accepted
    assert result.code is None


def test_rechaza_un_token_ausente_o_vacio():
    verifier = TurnstileVerifier(lambda token: True)

    for token in (None, "", "   "):
        result = verifier.verify(token)

        assert not result.accepted
        assert result.code == "turnstile_rejected"
        assert result.provider == "turnstile"
        assert not result.retryable


def test_rechaza_un_token_invalido():
    verifier = TurnstileVerifier(lambda token: False)

    result = verifier.verify("token-invalido")

    assert not result.accepted
    assert result.code == "turnstile_rejected"


def test_trata_la_indisponibilidad_como_error_reintentable():
    def verify(token: str) -> bool:
        raise TurnstileUnavailableError("servicio no disponible")

    verifier = TurnstileVerifier(verify)

    result = verifier.verify("token-valido")

    assert not result.accepted
    assert result.code == "turnstile_unavailable"
    assert result.retryable
    assert result.provider == "turnstile"


def test_la_verificacion_fallida_impide_aceptar_la_solicitud():
    limiter = RateLimiter(clock=FakeClock())
    verifier = TurnstileVerifier(lambda token: False)

    decision = evaluate_request(
        limiter=limiter,
        identity="opaco-a",
        endpoint="/reports",
        verifier=verifier,
        token="token-invalido",
    )

    assert not decision.allowed
    assert decision.code == "turnstile_rejected"
    assert decision.provider == "turnstile"


def test_la_solicitud_se_acepta_sin_verificador_cuando_no_corresponde():
    limiter = RateLimiter(clock=FakeClock())

    decision = evaluate_request(
        limiter=limiter,
        identity="opaco-a",
        endpoint="/analyze",
    )

    assert decision.allowed
    assert decision.code is None
