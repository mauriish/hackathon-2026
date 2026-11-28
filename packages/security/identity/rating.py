"""Rating explicable de señales de identidad frente a un catálogo inyectado."""

from __future__ import annotations

from collections.abc import Collection, Iterable
from dataclasses import dataclass
from enum import Enum

from .urls import UrlClassification, UrlStatus, _catalog_host, classify_url

__all__ = ["IdentityRating", "IdentityRatingResult", "rate_identity"]


class IdentityRating(str, Enum):
    """Resultado de contrastar evidencia de URL con identidades conocidas."""

    MATCHED = "matched"
    UNMATCHED = "unmatched"
    INSUFFICIENT = "insufficient"


_RATING_SCORE: dict[IdentityRating, int | None] = {
    IdentityRating.MATCHED: 0,
    IdentityRating.UNMATCHED: 20,
    IdentityRating.INSUFFICIENT: None,
}


@dataclass(frozen=True)
class IdentityRatingResult:
    """Rating junto con sus motivos y las clasificaciones observadas."""

    rating: IdentityRating
    explanation: str
    evidence: tuple[UrlClassification, ...]
    score: int | None = None


def _catalog_entries(catalog: Collection[str] | None) -> tuple[str, ...]:
    """Devuelve entradas comparables sin asumir que ``catalog`` es iterable."""

    if catalog is None:
        return ()
    if isinstance(catalog, str):
        return (catalog,)
    return tuple(catalog)


def _evidence_order(item: UrlClassification) -> tuple[str, str, str]:
    """Clave estable para devolver la evidencia de forma determinista."""

    return (item.status.value, item.normalized_url or "", item.host or "")


def rate_identity(
    urls: Iterable[str] | None, catalog: Collection[str] | None
) -> IdentityRatingResult:
    """Contrasta URLs de evidencia con el catálogo sin inferir fraude.

    El catálogo se recibe desde el consumidor (por ejemplo, la consulta al
    catálogo oficial de H26-10); esta función no accede a persistencia ni a red.
    La coincidencia es la exacta definida por :func:`classify_url`. Un catálogo
    nulo, vacío o sin entradas válidas se trata como información insuficiente;
    la evidencia se devuelve con un orden estable. El ``score`` es `0` para
    `MATCHED`, `20` para `UNMATCHED` y `None` para `INSUFFICIENT`.
    """

    entries = _catalog_entries(catalog)
    usable_catalog = any(_catalog_host(entry) is not None for entry in entries)

    if urls is None:
        return IdentityRatingResult(
            IdentityRating.INSUFFICIENT,
            "No se proporcionó evidencia de URL para evaluar.",
            (),
            score=_RATING_SCORE[IdentityRating.INSUFFICIENT],
        )

    candidates = (urls,) if isinstance(urls, str) else tuple(urls)
    classifications = tuple(
        sorted(
            (classify_url(url, entries) for url in candidates),
            key=_evidence_order,
        )
    )
    valid = tuple(item for item in classifications if item.status is not UrlStatus.INVALID)

    if not valid:
        return IdentityRatingResult(
            IdentityRating.INSUFFICIENT,
            "No hay URLs válidas en la evidencia disponible.",
            classifications,
            score=_RATING_SCORE[IdentityRating.INSUFFICIENT],
        )

    if not usable_catalog:
        return IdentityRatingResult(
            IdentityRating.INSUFFICIENT,
            "No hay datos disponibles en el catálogo para comparar.",
            classifications,
            score=_RATING_SCORE[IdentityRating.INSUFFICIENT],
        )

    if any(item.status is UrlStatus.KNOWN for item in valid):
        return IdentityRatingResult(
            IdentityRating.MATCHED,
            "Al menos un dominio de la evidencia coincide exactamente con el catálogo.",
            classifications,
            score=_RATING_SCORE[IdentityRating.MATCHED],
        )

    return IdentityRatingResult(
        IdentityRating.UNMATCHED,
        "No se encontró coincidencia en el catálogo; un dominio desconocido no "
        "constituye por sí solo evidencia de fraude.",
        classifications,
        score=_RATING_SCORE[IdentityRating.UNMATCHED],
    )
