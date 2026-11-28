"""Deduplicación de reportes saneados y prevención de data poisoning."""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from hashlib import sha256
from typing import Protocol

PENDING_STATUS = "pending"
_TARGET_KINDS = ("app", "link")


class FingerprintStore(Protocol):
    """Almacén de huellas inyectable; solo guarda resúmenes hexadecimales."""

    def contains(self, fingerprint: str) -> bool: ...

    def add(self, fingerprint: str) -> None: ...


class InMemoryFingerprintStore:
    """Almacén en memoria, sin persistencia ni contenido original."""

    def __init__(self) -> None:
        self._fingerprints: set[str] = set()

    def contains(self, fingerprint: str) -> bool:
        """Indica si la huella ya fue registrada."""
        return fingerprint in self._fingerprints

    def add(self, fingerprint: str) -> None:
        """Registra una huella nueva."""
        self._fingerprints.add(fingerprint)

    @property
    def fingerprints(self) -> frozenset[str]:
        """Devuelve una copia inmutable de las huellas registradas."""
        return frozenset(self._fingerprints)


@dataclass(frozen=True)
class DeduplicationDecision:
    """Decisión sobre un reporte; nunca incluye el contenido del reporte."""

    fingerprint: str
    duplicate: bool
    accepted: bool
    status: str = PENDING_STATUS
    requires_independent_validation: bool = True
    publication_allowed: bool = False


def _normalize(value: str, *, casefold: bool) -> str:
    """Canoniza espacios y composición Unicode antes de calcular la huella."""
    normalized = " ".join(unicodedata.normalize("NFKC", value).split())
    return normalized.casefold() if casefold else normalized


def compute_fingerprint(
    *,
    target_kind: str,
    target_value: str,
    sanitized_message: str,
    sanitized_context: str,
) -> str:
    """Calcula SHA-256 del contenido saneado canónico.

    Solo entran destinos saneados, mensaje y contexto saneados. La IP, el
    `abuse_id`, los tokens y el texto original no son entradas de esta función
    y, por tanto, nunca quedan reflejados en la huella.
    """
    if target_kind not in _TARGET_KINDS:
        raise ValueError("target_kind debe ser 'app' o 'link'")
    if not isinstance(target_value, str) or not _normalize(target_value, casefold=False):
        raise ValueError("target_value saneado no puede estar vacío")
    if not isinstance(sanitized_message, str) or not _normalize(
        sanitized_message, casefold=True
    ):
        raise ValueError("sanitized_message no puede estar vacío")
    if not isinstance(sanitized_context, str):
        raise ValueError("sanitized_context debe ser texto")

    canonical = "\x1f".join(
        (
            _normalize(target_kind, casefold=False),
            _normalize(target_value, casefold=False),
            _normalize(sanitized_message, casefold=True),
            _normalize(sanitized_context, casefold=True),
        )
    )
    return sha256(canonical.encode("utf-8")).hexdigest()


class Deduplicator:
    """Detecta duplicados con `hashlib` y un almacén inyectable.

    El primer reporte con una huella determinada se acepta y se registra; los
    siguientes se marcan como duplicados y no suman ni se vuelven a registrar.
    Toda decisión queda pendiente y requiere validación independiente antes de
    cualquier publicación.
    """

    def __init__(self, store: FingerprintStore | None = None) -> None:
        self._store = store if store is not None else InMemoryFingerprintStore()

    def evaluate(
        self,
        *,
        target_kind: str,
        target_value: str,
        sanitized_message: str,
        sanitized_context: str,
    ) -> DeduplicationDecision:
        """Evalúa un reporte saneado sin exponer su contenido en la decisión."""
        fingerprint = compute_fingerprint(
            target_kind=target_kind,
            target_value=target_value,
            sanitized_message=sanitized_message,
            sanitized_context=sanitized_context,
        )
        duplicate = self._store.contains(fingerprint)
        if not duplicate:
            self._store.add(fingerprint)

        return DeduplicationDecision(
            fingerprint=fingerprint,
            duplicate=duplicate,
            accepted=not duplicate,
        )
