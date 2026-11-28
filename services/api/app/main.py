"""Punto de entrada HTTP del servicio API."""

from fastapi import FastAPI

from app.config import get_settings


settings = get_settings()
app = FastAPI(title=settings.app_name)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Indica que el proceso API está disponible."""
    return {"status": "ok"}
