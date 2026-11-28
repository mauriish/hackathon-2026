"""Configuración validada desde variables de entorno."""

import os
from functools import lru_cache

from pydantic import BaseModel, ConfigDict, Field, ValidationError


class Settings(BaseModel):
    """Configuración mínima necesaria para iniciar el servicio."""

    model_config = ConfigDict(extra="forbid")

    app_name: str = Field(default="Hackathon API", min_length=1)
    environment: str = Field(default="development", min_length=1)
    host: str = Field(default="127.0.0.1", min_length=1)
    port: int = Field(default=8000, ge=1, le=65535)


@lru_cache
def get_settings() -> Settings:
    """Carga únicamente variables APP_*; secretos no se incluyen en código."""
    raw_settings = {
        "app_name": os.getenv("APP_NAME", "Hackathon API"),
        "environment": os.getenv("APP_ENV", "development"),
        "host": os.getenv("APP_HOST", "127.0.0.1"),
        "port": os.getenv("APP_PORT", "8000"),
    }
    try:
        return Settings.model_validate(raw_settings)
    except ValidationError as exc:
        raise ValueError("Configuración APP_* inválida") from exc
