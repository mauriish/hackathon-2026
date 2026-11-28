"""Rating explicable de señales de identidad frente a un catálogo inyectado."""

from __future__ import annotations

from collections.abc import Collection, Iterable
from dataclasses import dataclass
from enum import Enum

from .urls import UrlClassification, UrlStatus, classify_url

__all__ = ["IdentityRating", "IdentityRatingResult", "rate_identity"]


class IdentityRating(str, Enum):
    """Resultado de contrastar evidencia de URL con identidades conocidas."""

    MATCHED = "matched"
    UNMATCHED = "unmatched"
    INSUFFICIENT = "insufficient"


@dataclass(frozen=True)
class IdentityRatingResult:
    """Rating junto con sus motivos y las clasificaciones observadas."""

    rating: IdentityRating
    explanation: str
    evidence: tuple[UrlClassification, ...]


def rate_identity(
    urls: Iterable[str] | None, catalog: Collection[str]
) -> IdentityRatingResult:
    """Contrasta URLs de evidencia con el catálogo sin inferir fraude.

    El catálogo se recibe desde el consumidor (por ejemplo, la consulta al
    catálogo oficial de H26-10); esta función no accede a persistencia ni a red.
    La coincidencia es la exacta definida por :func:`classify_url`.
    """

    if urls is None:
        return IdentityRatingResult(
            IdentityRating.INSUFFICIENT,
            "No se proporcionó evidencia de URL para evaluar.",
            (),
        )

    classifications = tuple(classify_url(url, catalog) for url in urls)
    valid = tuple(item for item in classifications if item.status is not UrlStatus.INVALID)

    if not valid or not catalog:
        return IdentityRatingResult(
            IdentityRating.INSUFFICIENT,
            (
                "No hay URLs válidas en la evidencia disponible."
                if not valid
                else "No hay datos disponibles en el catálogo para comparar."
            ),
            classifications,
        )

    if any(item.status is UrlStatus.KNOWN for item in valid):
        return IdentityRatingResult(
            IdentityRating.MATCHED,
            "Al menos un dominio de la evidencia coincide exactamente con el catálogo.",
            classifications,
        )

    return IdentityRatingResult(
        IdentityRating.UNMATCHED,
        "No se encontró coincidencia en el catálogo; un dominio desconocido no "
        "constituye por sí solo evidencia de fraude.",
        classifications,
    )
