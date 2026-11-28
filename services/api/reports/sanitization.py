"""Redacción determinista de datos sensibles antes de persistir reportes."""

import re
from urllib.parse import urlsplit, urlunsplit

_REDACTED = "[dato redactado]"
_URL_PATTERN = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
_PATTERNS = (
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
    re.compile(r"(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)"),
    re.compile(r"\b(?:\d[ -]*?){13,19}\b"),
    re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    re.compile(
        r"\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:[-'][A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]+)?"
        r"(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+\b"
    ),
    re.compile(
        r"\b(?:calle|avenida|av\.?|carrera|carretera|paseo)\s+"
        r"[^,;\n]{1,80}\s+\d+[A-Z]?\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:contrase(?:ñ|n)a|password|token|c[oó]digo de acceso|"
        r"n[uú]mero de tarjeta|cuenta bancaria)\s*[:=]\s*\S+",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:nombre|domicilio|direcci[oó]n|usuario|username)\s*[:=]\s*"
        r"[^,;.\n]+",
        re.IGNORECASE,
    ),
)


def _sanitize_url(match: re.Match[str]) -> str:
    parsed = urlsplit(match.group())
    if not parsed.hostname:
        return _REDACTED
    host = parsed.hostname
    if ":" in host:
        host = f"[{host}]"
    if parsed.port is not None:
        host = f"{host}:{parsed.port}"
    return urlunsplit((parsed.scheme, host, parsed.path, "", ""))


def sanitize_text(value: str) -> str:
    """Redacta patrones sensibles reconocibles y normaliza espacios."""
    sanitized = _URL_PATTERN.sub(_sanitize_url, value)
    for pattern in _PATTERNS:
        sanitized = pattern.sub(_REDACTED, sanitized)
    return " ".join(sanitized.split())
