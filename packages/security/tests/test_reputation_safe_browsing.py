"""Pruebas unitarias de consultas a Safe Browsing sin red real."""

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from packages.security.reputation import (  # noqa: E402
    ReputationStatus,
    check_url,
)


class _FakeResponse:
    """Respuesta mínima con protocolo de contexto para `urlopen`."""

    def __init__(self, payload: bytes, status: int = 200) -> None:
        self._payload = payload
        self.status = status

    def read(self) -> bytes:
        return self._payload

    def __enter__(self):
        return self

    def __exit__(self, *args) -> bool:
        return False


class _FakeOpener:
    """Registra peticiones y devuelve una respuesta controlada."""

    def __init__(
        self,
        *,
        payload: bytes = b"{}",
        status: int = 200,
        error: Exception | None = None,
    ) -> None:
        self.payload = payload
        self.status = status
        self.error = error
        self.requests = []

    def __call__(self, request, timeout=None):
        self.requests.append(request)
        if self.error is not None:
            raise self.error
        return _FakeResponse(self.payload, self.status)


def _amenaza() -> bytes:
    return json.dumps(
        {"matches": [{"threatType": "SOCIAL_ENGINEERING"}]}
    ).encode("utf-8")


def test_detecta_amenaza_y_expone_fuente_y_disponibilidad():
    opener = _FakeOpener(payload=_amenaza())

    resultado = check_url(
        "https://sos.example.invalid/verificar?token=secreto",
        api_key="clave-de-prueba",
        opener=opener,
    )

    assert resultado.status is ReputationStatus.THREAT
    assert resultado.available is True
    assert resultado.provider_status == {
        "provider": "google_safe_browsing",
        "status": "available",
    }
    assert resultado.evidence[0]["source"] == "google_safe_browsing"
    assert resultado.evidence[0]["evidence_id"].startswith("gsb-")
    assert "secreto" not in json.dumps(resultado.evidence, ensure_ascii=False)


def test_ausencia_de_amenaza_mantiene_el_proveedor_disponible():
    resultado = check_url(
        "https://example.invalid/ruta", api_key="clave-de-prueba", opener=_FakeOpener()
    )

    assert resultado.status is ReputationStatus.NO_THREAT
    assert resultado.available is True
    assert resultado.provider_status["status"] == "available"
    assert len(resultado.evidence) == 1


def test_timeout_marca_proveedor_no_disponible_sin_lanzar():
    opener = _FakeOpener(error=TimeoutError("tiempo agotado"))

    resultado = check_url(
        "https://example.invalid", api_key="clave-de-prueba", opener=opener
    )

    assert resultado.status is ReputationStatus.UNAVAILABLE
    assert resultado.available is False
    assert resultado.evidence == ()
    error = resultado.provider_status["error"]
    assert error["code"] == "provider_unavailable"
    assert error["retryable"] is True
    assert "tiempo agotado" not in error["message"]


@pytest.mark.parametrize(
    "payload",
    [b"no-es-json", b'{"matches": "invalido"}', b"[]"],
)
def test_respuesta_invalida_no_bloquea(payload):
    resultado = check_url(
        "https://example.invalid",
        api_key="clave-de-prueba",
        opener=_FakeOpener(payload=payload),
    )

    assert resultado.status is ReputationStatus.UNAVAILABLE
    error = resultado.provider_status["error"]
    assert error["code"] == "provider_invalid_response"
    assert error["retryable"] is False


def test_sin_clave_no_consulta_y_no_bloquea(monkeypatch):
    monkeypatch.delenv("GOOGLE_SAFE_BROWSING_API_KEY", raising=False)
    opener = _FakeOpener()

    resultado = check_url("https://example.invalid", opener=opener)

    assert opener.requests == []
    assert resultado.status is ReputationStatus.UNAVAILABLE
    assert resultado.provider_status["error"]["code"] == "provider_unavailable"
    assert resultado.provider_status["error"]["retryable"] is False


def test_url_invalida_no_se_envia_al_proveedor():
    opener = _FakeOpener()

    resultado = check_url(
        "javascript:alert(1)", api_key="clave-de-prueba", opener=opener
    )

    assert opener.requests == []
    assert resultado.status is ReputationStatus.UNAVAILABLE
    assert resultado.provider_status["error"]["code"] == "invalid_report"


def test_solo_se_envia_la_url_normalizada_sin_datos_sensibles():
    opener = _FakeOpener()

    resultado = check_url(
        "https://mal.example.invalid/ruta?token=supersecreto#fragmento",
        api_key="clave-de-prueba",
        opener=opener,
    )

    peticion = opener.requests[0]
    cuerpo = json.loads(peticion.data)
    serializado = json.dumps(cuerpo)

    assert cuerpo["threatInfo"]["threatEntries"] == [
        {"url": "https://mal.example.invalid/ruta"}
    ]
    assert "supersecreto" not in serializado
    assert "fragmento" not in serializado
    assert peticion.full_url.startswith(
        "https://safebrowsing.googleapis.com/v4/threatMatches:find?key="
    )
    assert "mal.example.invalid" not in peticion.full_url
    assert resultado.normalized_url == "https://mal.example.invalid/ruta"


@pytest.mark.parametrize(("codigo", "reintentable"), [(503, True), (400, False)])
def test_estado_http_se_refleja_en_disponibilidad(codigo, reintentable):
    resultado = check_url(
        "https://example.invalid",
        api_key="clave-de-prueba",
        opener=_FakeOpener(status=codigo),
    )

    assert resultado.status is ReputationStatus.UNAVAILABLE
    assert resultado.provider_status["error"]["code"] == "provider_unavailable"
    assert resultado.provider_status["error"]["retryable"] is reintentable


def test_la_clave_puede_venir_del_entorno(monkeypatch):
    monkeypatch.setenv("GOOGLE_SAFE_BROWSING_API_KEY", "clave-del-entorno")
    opener = _FakeOpener()

    check_url("https://example.invalid", opener=opener)

    assert "key=clave-del-entorno" in opener.requests[0].full_url
