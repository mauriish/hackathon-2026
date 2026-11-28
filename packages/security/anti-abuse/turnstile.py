"""Verificación fail-closed del token de Cloudflare Turnstile."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


class TurnstileUnavailableError(Exception):
    """El proveedor de Turnstile no pudo ser consultado."""


@dataclass(frozen=True)
class TurnstileResult:
    """Resultado de verificar un token de Turnstile."""

    accepted: bool
    code: str | None = None
    retryable: bool = False
    provider: str | None = None


class TurnstileVerifier:
    """Adaptador inyectable; no realiza llamadas de red por sí mismo."""

    def __init__(self, verify: Callable[[str], bool]) -> None:
        if not callable(verify):
            raise ValueError("verify debe ser invocable")
        self._verify = verify

    def verify(self, token: str | None) -> TurnstileResult:
        """Rechaza tokens ausentes o inválidos y errores de disponibilidad."""
        if not isinstance(token, str) or not token.strip():
            return TurnstileResult(
                accepted=False,
                code="turnstile_rejected",
                retryable=False,
                provider="turnstile",
            )

        try:
            verified = self._verify(token)
        except TurnstileUnavailableError:
            return TurnstileResult(
                accepted=False,
                code="turnstile_unavailable",
                retryable=True,
                provider="turnstile",
            )

        # El adaptador concreto traduce errores de transporte a
        # TurnstileUnavailableError; otras excepciones no se silencian.
        if verified is not True:
            return TurnstileResult(
                accepted=False,
                code="turnstile_rejected",
                retryable=False,
                provider="turnstile",
            )

        return TurnstileResult(accepted=True)
