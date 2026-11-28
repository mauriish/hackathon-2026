"""Controles antiabuso: límite de frecuencia, Turnstile y deduplicación."""

from .deduplication import (
    DeduplicationDecision,
    Deduplicator,
    FingerprintStore,
    InMemoryFingerprintStore,
    compute_fingerprint,
)
from .guard import RequestDecision, evaluate_request
from .rate_limit import RateLimitDecision, RateLimiter
from .turnstile import (
    TurnstileResult,
    TurnstileUnavailableError,
    TurnstileVerifier,
)

__all__ = [
    "DeduplicationDecision",
    "Deduplicator",
    "FingerprintStore",
    "InMemoryFingerprintStore",
    "RateLimitDecision",
    "RateLimiter",
    "RequestDecision",
    "TurnstileResult",
    "TurnstileUnavailableError",
    "TurnstileVerifier",
    "compute_fingerprint",
    "evaluate_request",
]
