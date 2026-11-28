"""Pruebas de validación de configuración."""

import pytest
from pydantic import ValidationError

from app.config import Settings, get_settings


def test_settings_reject_invalid_port() -> None:
    with pytest.raises(ValidationError):
        Settings(port=70000)


def test_settings_defaults_are_valid() -> None:
    settings = Settings()

    assert settings.host == "127.0.0.1"
    assert settings.port == 8000


def test_invalid_environment_configuration_prevents_startup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("APP_PORT", "not-a-port")
    get_settings.cache_clear()

    try:
        with pytest.raises(ValueError, match="Configuración APP_\\* inválida"):
            get_settings()
    finally:
        get_settings.cache_clear()
