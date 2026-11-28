"""Combinación mínima de los controles antiabuso."""

from __future__ import annotations

from dataclasses import dataclass

from .rate_limit import RateLimiter
from .turnstile import TurnstileResult, TurnstileVerifier


@dataclass(frozen=True)
class RequestDecision:
    """Decisión agregada sobre una solicitud entrante."""

    allowed: bool
    status_code: int | None = None
    code: str | None = None
    retry_after_seconds: int = 0
    provider: str | None = None
    retryable: bool = False


def evaluate_request(
    *,
    limiter: RateLimiter,
    identity: str,
    endpoint: str,
    verifier: TurnstileVerifier | None = None,
    token: str | None = None,
) -> RequestDecision:
    """Aplica el límite primero y, si pasa, verifica Turnstile si se aporta.

    Al superarse el límite no se solicita ni verifica un CAPTCHA nuevo: se
    devuelve ``rate_limited`` con estado 429 y tiempo de reintento.
    """
    limited = limiter.check(identity=identity, endpoint=endpoint)
    if not limited.allowed:
        return RequestDecision(
            allowed=False,
            status_code=limited.status_code,
            code=limited.code,
            retry_after_seconds=limited.retry_after_seconds,
            retryable=True,
        )

    if verifier is not None:
        captcha: TurnstileResult = verifier.verify(token)
        if not captcha.accepted:
            return RequestDecision(
                allowed=False,
                code=captcha.code,
                provider=captcha.provider,
                retryable=captcha.retryable,
            )

    return RequestDecision(allowed=True)
