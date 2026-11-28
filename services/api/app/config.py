"""Configuración validada desde variables de entorno."""

import os
from functools import lru_cache

from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError


class Settings(BaseModel):
    """Configuración mínima necesaria para iniciar el servicio."""

    model_config = ConfigDict(extra="forbid")

    app_name: str = Field(default="Hackathon API", min_length=1)
    environment: str = Field(default="development", min_length=1)
    host: str = Field(default="127.0.0.1", min_length=1)
    port: int = Field(default=8000, ge=1, le=65535)
    database_url: str | None = None
    abuse_hmac_secret: SecretStr | None = None
    turnstile_secret_key: SecretStr | None = None


@lru_cache
def get_settings() -> Settings:
    """Carga la configuración del API sin exponer los secretos en repr."""
    raw_settings = {
        "app_name": os.getenv("APP_NAME", "Hackathon API"),
        "environment": os.getenv("APP_ENV", "development"),
        "host": os.getenv("APP_HOST", "127.0.0.1"),
        "port": os.getenv("APP_PORT", "8000"),
        "database_url": os.getenv("API_DATABASE_URL"),
        "abuse_hmac_secret": os.getenv("API_ABUSE_HMAC_SECRET"),
        "turnstile_secret_key": os.getenv("TURNSTILE_SECRET_KEY"),
    }
    try:
        return Settings.model_validate(raw_settings)
    except ValidationError as exc:
        raise ValueError("Configuración APP_* inválida") from exc
