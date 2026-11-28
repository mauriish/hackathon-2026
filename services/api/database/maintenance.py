"""Tareas periódicas de mantenimiento de la base de datos."""

import asyncio
import logging

from .repository import connect, purge_expired_abuse_identifiers

logger = logging.getLogger(__name__)

PURGE_INTERVAL_SECONDS = 60 * 60
PURGE_RETRY_SECONDS = 60


def _purge_expired_identifiers(database_url: str) -> int:
    """Abre una conexión independiente y elimina seudónimos vencidos."""
    with connect(database_url) as connection:
        return purge_expired_abuse_identifiers(connection)


async def run_periodic_expired_abuse_purge(database_url: str) -> None:
    """Purga al iniciar y cada hora; reintenta en un minuto si falla."""
    while True:
        try:
            deleted = await asyncio.to_thread(
                _purge_expired_identifiers,
                database_url,
            )
        except Exception:
            logger.exception(
                "Falló la purga de identificadores antiabuso expirados; "
                "se reintentará en %s segundos",
                PURGE_RETRY_SECONDS,
            )
            delay = PURGE_RETRY_SECONDS
        else:
            if deleted:
                logger.info(
                    "Se eliminaron %s identificadores antiabuso expirados",
                    deleted,
                )
            delay = PURGE_INTERVAL_SECONDS

        await asyncio.sleep(delay)
