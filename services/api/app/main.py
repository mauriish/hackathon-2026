"""Punto de entrada HTTP del servicio API."""

import asyncio
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from app.config import get_settings
from database.maintenance import run_periodic_expired_abuse_purge


settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Gestiona la tarea periódica de purga cuando hay base configurada."""
    database_url = os.getenv("API_DATABASE_URL")
    purge_task = (
        asyncio.create_task(run_periodic_expired_abuse_purge(database_url))
        if database_url
        else None
    )
    try:
        yield
    finally:
        if purge_task is not None:
            purge_task.cancel()
            with suppress(asyncio.CancelledError):
                await purge_task


app = FastAPI(title=settings.app_name, lifespan=lifespan)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Indica que el proceso API está disponible."""
    return {"status": "ok"}
