"""Límite de frecuencia determinista por identidad opaca y endpoint."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from math import ceil
from time import monotonic
from typing import Callable

DEFAULT_MAX_REQUESTS = 20
DEFAULT_WINDOW_SECONDS = 60


@dataclass(frozen=True)
class RateLimitDecision:
    """Resultado de comprobar el límite de frecuencia."""

    allowed: bool
    status_code: int | None = None
    code: str | None = None
    retry_after_seconds: int = 0


class RateLimiter:
    """Ventana deslizante en memoria, sin persistencia ni datos personales.

    La identidad debe ser opaca: el llamador decide si usa un seudónimo HMAC
    de 14 días, un identificador de usuario autenticado u otro valor sin
    información personal. La IP cruda nunca debe pasar a este componente.
    """

    def __init__(
        self,
        *,
        max_requests: int = DEFAULT_MAX_REQUESTS,
        window_seconds: int = DEFAULT_WINDOW_SECONDS,
        clock: Callable[[], float] = monotonic,
    ) -> None:
        if max_requests < 1:
            raise ValueError("max_requests debe ser mayor o igual a 1")
        if window_seconds < 1:
            raise ValueError("window_seconds debe ser mayor o igual a 1")
        if not callable(clock):
            raise ValueError("clock debe ser invocable")

        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._clock = clock
        self._events: dict[tuple[str, str], deque[float]] = {}

    @property
    def max_requests(self) -> int:
        return self._max_requests

    @property
    def window_seconds(self) -> int:
        return self._window_seconds

    def check(self, *, identity: str, endpoint: str) -> RateLimitDecision:
        """Registra una solicitud y devuelve si está dentro del límite."""
        if not isinstance(identity, str) or not identity:
            raise ValueError("identity debe ser una cadena no vacía")
        if not isinstance(endpoint, str) or not endpoint:
            raise ValueError("endpoint debe ser una cadena no vacía")

        now = self._clock()
        key = (identity, endpoint)
        event_times = self._events.setdefault(key, deque())

        cutoff = now - self._window_seconds
        while event_times and event_times[0] <= cutoff:
            event_times.popleft()

        if len(event_times) >= self._max_requests:
            retry_after = max(1, ceil(event_times[0] + self._window_seconds - now))
            return RateLimitDecision(
                allowed=False,
                status_code=429,
                code="rate_limited",
                retry_after_seconds=retry_after,
            )

        event_times.append(now)
        return RateLimitDecision(allowed=True)
