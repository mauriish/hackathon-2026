"""Pruebas unitarias de extracción, normalización y comparación de URLs."""

import socket
import sys
import urllib.request
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from packages.security.identity import (  # noqa: E402
    UrlStatus,
    classify_url,
    extract_first_url,
    normalize_url,
)


def test_extrae_la_primera_url_de_un_texto():
    texto = "Consulta https://Example.ORG/ruta?x=1 o http://example.invalid/."

    assert extract_first_url(texto) == "https://Example.ORG/ruta?x=1"


def test_no_extrae_url_cuando_no_hay_candidato():
    assert extract_first_url("texto sin enlaces") is None


def test_extrae_url_ignora_puntuacion_final():
    assert extract_first_url("Abre (https://example.org/path).") == (
        "https://example.org/path"
    )


@pytest.mark.parametrize(
    ("entrada", "esperado"),
    [
        ("HTTP://Example.ORG:80/", "http://example.org/"),
        ("https://example.org:443/ruta/", "https://example.org/ruta"),
        ("https://example.org/ruta?x=1#frag", "https://example.org/ruta"),
        ("http://bücher.invalid/", "http://xn--bcher-kva.invalid/"),
        ("http://[::1]:80/ruta", "http://[::1]/ruta"),
    ],
)
def test_normaliza_urls_validas(entrada, esperado):
    assert normalize_url(entrada) == esperado


@pytest.mark.parametrize(
    "entrada",
    [
        "",
        "example.org",
        "ftp://example.org",
        "https://",
        "https://usuario:clave@example.org",
        "https://example.org/ruta con espacio",
        "https://example.org:70000/",
        "https://example.org:puerto/",
        "https://example\t.org",
        None,
    ],
)
def test_rechaza_urls_invalidas(entrada):
    assert normalize_url(entrada) is None


def test_clasifica_dominio_conocido():
    resultado = classify_url("https://example.org/ruta", {"example.org"})

    assert resultado.status is UrlStatus.KNOWN
    assert resultado.host == "example.org"
    assert resultado.normalized_url == "https://example.org/ruta"


def test_clasifica_dominio_desconocido_incluso_con_catalogo_vacio():
    resultado = classify_url("https://example.invalid/ruta", set())

    assert resultado.status is UrlStatus.UNKNOWN
    assert resultado.host == "example.invalid"


def test_clasifica_dominio_desconocido_cuando_cambia_el_subdominio():
    resultado = classify_url("https://www.example.org", {"example.org"})

    assert resultado.status is UrlStatus.UNKNOWN
    assert resultado.host == "www.example.org"


def test_clasifica_entrada_invalida_sin_normalizar():
    resultado = classify_url("javascript:alert(1)", {"example.org"})

    assert resultado.status is UrlStatus.INVALID
    assert resultado.host is None
    assert resultado.normalized_url is None


def test_acepta_catalogo_con_urls_y_normaliza_sus_hosts():
    resultado = classify_url(
        "https://ejemplo.invalid/ruta",
        {"HTTPS://Ejemplo.INVALID:443/"},
    )

    assert resultado.status is UrlStatus.KNOWN
    assert resultado.host == "ejemplo.invalid"


def test_no_realiza_navegacion(monkeypatch):
    def fallar(*args, **kwargs):
        raise AssertionError("Se intentó acceder a la red")

    monkeypatch.setattr(socket, "create_connection", fallar)
    monkeypatch.setattr(socket, "getaddrinfo", fallar)
    monkeypatch.setattr(urllib.request, "urlopen", fallar)

    assert classify_url("https://example.org", {"example.org"}).status is (
        UrlStatus.KNOWN
    )
    assert normalize_url("https://example.invalid/ruta") == (
        "https://example.invalid/ruta"
    )
