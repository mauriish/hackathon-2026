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


def test_report_secrets_load_without_exposing_values(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    hmac_secret = "test-hmac-secret-with-at-least-32-bytes"
    turnstile_secret = "test-turnstile-secret"
    monkeypatch.setenv("API_DATABASE_URL", "postgresql://example.invalid/test")
    monkeypatch.setenv("API_ABUSE_HMAC_SECRET", hmac_secret)
    monkeypatch.setenv("TURNSTILE_SECRET_KEY", turnstile_secret)
    get_settings.cache_clear()

    try:
        settings = get_settings()

        assert settings.database_url == "postgresql://example.invalid/test"
        assert settings.abuse_hmac_secret is not None
        assert settings.abuse_hmac_secret.get_secret_value() == hmac_secret
        assert settings.turnstile_secret_key is not None
        assert settings.turnstile_secret_key.get_secret_value() == turnstile_secret
        assert hmac_secret not in repr(settings)
        assert turnstile_secret not in repr(settings)
    finally:
        get_settings.cache_clear()
