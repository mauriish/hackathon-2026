"""Extracción, normalización y comparación de URLs sin acceso a red.

Las funciones son puras: no resuelven DNS, no abren conexiones y no leen
catálogos externos. El catálogo se inyecta en cada llamada de clasificación.
"""

from __future__ import annotations

import ipaddress
import re
from collections.abc import Collection
from dataclasses import dataclass
from enum import Enum
from urllib.parse import urlsplit

__all__ = [
    "UrlStatus",
    "UrlClassification",
    "extract_first_url",
    "normalize_url",
    "classify_url",
]


class UrlStatus(str, Enum):
    """Estado de una URL frente al catálogo inyectado."""

    KNOWN = "known"
    UNKNOWN = "unknown"
    INVALID = "invalid"


@dataclass(frozen=True)
class UrlClassification:
    """Resultado observable de clasificar una URL."""

    status: UrlStatus
    normalized_url: str | None
    host: str | None


_SCHEMES = frozenset({"http", "https"})
_DEFAULT_PORTS = {"http": 80, "https": 443}
_URL_PATTERN = re.compile(r"https?://[^\s<>'\"]+", re.IGNORECASE)
_TRAILING_PUNCTUATION = ".,;:!?)]}>"
_CONTROL_CHARACTERS = re.compile(r"[\x00-\x20\x7f]")
_HOST_LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")


def extract_first_url(text: str) -> str | None:
    """Devuelve el primer candidato http(s) de un texto, o ``None``."""

    if not isinstance(text, str):
        return None
    match = _URL_PATTERN.search(text)
    if match is None:
        return None
    return match.group(0).rstrip(_TRAILING_PUNCTUATION) or None


def _normalize_host(candidate: str) -> str | None:
    host = candidate.strip().rstrip(".").lower()
    if not host or _CONTROL_CHARACTERS.search(host):
        return None
    try:
        return str(ipaddress.ip_address(host))
    except ValueError:
        pass
    try:
        ascii_host = host.encode("idna").decode("ascii").lower()
    except UnicodeError:
        return None
    if len(ascii_host) > 253:
        return None
    labels = ascii_host.split(".")
    if any(_HOST_LABEL.fullmatch(label) is None for label in labels):
        return None
    return ascii_host


def normalize_url(value: str) -> str | None:
    """Canonicaliza una URL http(s); devuelve ``None`` si no es válida.

    La forma canónica conserva esquema, host, puerto no predeterminado y ruta;
    descarta consulta y fragmento porque el catálogo se compara por host.
    """

    if not isinstance(value, str):
        return None
    candidate = value.strip()
    if not candidate or _CONTROL_CHARACTERS.search(candidate):
        return None
    try:
        parts = urlsplit(candidate)
        raw_host = parts.hostname
        port = parts.port
    except ValueError:
        return None
    scheme = parts.scheme.lower()
    if scheme not in _SCHEMES or "@" in parts.netloc or not raw_host:
        return None
    host = _normalize_host(raw_host)
    if host is None:
        return None
    if port is not None and not 1 <= port <= 65535:
        return None

    authority = f"[{host}]" if ":" in host else host
    if port is not None and port != _DEFAULT_PORTS[scheme]:
        authority = f"{authority}:{port}"
    path = parts.path.rstrip("/") or ("/" if parts.path.startswith("/") else "")
    return f"{scheme}://{authority}{path}"


def _catalog_host(entry: str) -> str | None:
    if not isinstance(entry, str):
        return None
    candidate = entry.strip()
    if "://" in candidate:
        try:
            candidate = urlsplit(candidate).hostname or ""
        except ValueError:
            return None
    return _normalize_host(candidate)


def classify_url(value: str, catalog: Collection[str]) -> UrlClassification:
    """Clasifica una URL como conocida, desconocida o inválida.

    ``catalog`` es una colección de hosts (o URLs, de las que se toma el host).
    La comparación es exacta sobre el host normalizado; no se infieren dominios
    registrables ni se realiza ninguna consulta externa.
    """

    normalized = normalize_url(value)
    if normalized is None:
        return UrlClassification(UrlStatus.INVALID, None, None)
    host = urlsplit(normalized).hostname
    if host is None:
        return UrlClassification(UrlStatus.INVALID, None, None)
    known_hosts = {
        entry for item in catalog if (entry := _catalog_host(item)) is not None
    }
    status = UrlStatus.KNOWN if host in known_hosts else UrlStatus.UNKNOWN
    return UrlClassification(status, normalized, host)
