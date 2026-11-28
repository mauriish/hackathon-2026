"""Resultados de reputación alineados con el contrato público v1."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

__all__ = ["Provider", "ReputationResult", "ReputationStatus"]

PROVIDER = "google_safe_browsing"
SOURCE = "google_safe_browsing"


class Provider(str, Enum):
    """Proveedor de reputación autorizado por el stack del proyecto."""

    GOOGLE_SAFE_BROWSING = PROVIDER


class ReputationStatus(str, Enum):
    """Estado observable de una consulta de reputación."""

    THREAT = "threat"
    NO_THREAT = "no_threat"
    UNAVAILABLE = "unavailable"


@dataclass(frozen=True)
class ReputationResult:
    """Salida de una consulta: señal, evidencia y estado del proveedor.

    Los diccionarios ``evidence`` y ``provider_status`` usan exactamente los
    nombres de `Evidence` y `ProviderStatus` del contrato v1. El consumidor debe
    tratarlos como de solo lectura.
    """

    status: ReputationStatus
    normalized_url: str | None
    description: str
    provider_status: dict[str, Any]
    evidence: tuple[dict[str, str], ...] = field(default_factory=tuple)
    source: str = SOURCE
    provider: str = PROVIDER

    @property
    def available(self) -> bool:
        """Indica si el proveedor respondió y la señal es utilizable."""

        return self.status is not ReputationStatus.UNAVAILABLE
