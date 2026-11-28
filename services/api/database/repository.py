"""Persistencia de ReportRecord y auditoría de cambios de estado."""

from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import psycopg
from psycopg.rows import dict_row

from .models import ReportRecord, ReportStatus, StoredReport


def connect(database_url: str) -> psycopg.Connection[dict[str, Any]]:
    """Abre una conexión PostgreSQL; el llamador debe cerrarla."""
    if not database_url.strip():
        raise ValueError("Se requiere una URL de PostgreSQL")
    return psycopg.connect(database_url, row_factory=dict_row)


def create_report(
    connection: psycopg.Connection[Any], record: ReportRecord
) -> None:
    """Guarda un ReportRecord saneado y registra su estado inicial."""
    with connection.transaction():
        with connection.cursor() as cursor:
            _purge_expired(cursor, datetime.now(timezone.utc))
            cursor.execute(
                """
                INSERT INTO report_records (
                    report_id, created_at, target_kind, target_value,
                    sanitized_message, sanitized_context, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    record.report_id,
                    record.created_at,
                    record.target.kind,
                    record.target.value,
                    record.sanitized_message,
                    record.sanitized_context,
                    record.status.value,
                ),
            )
            cursor.execute(
                """
                INSERT INTO report_abuse_identifiers (
                    report_id, issued_at, abuse_id, expires_at
                ) VALUES (%s, %s, %s, %s)
                """,
                (
                    record.report_id,
                    record.created_at,
                    record.abuse_id,
                    record.abuse_id_expires_at,
                ),
            )
            cursor.execute(
                """
                INSERT INTO report_status_audit (
                    report_id, previous_status, new_status
                ) VALUES (%s, NULL, %s)
                """,
                (record.report_id, record.status.value),
            )


def get_report(
    connection: psycopg.Connection[dict[str, Any]], report_id: UUID
) -> StoredReport | None:
    """Obtiene los datos saneados sin prolongar la vida del identificador."""
    with connection.transaction():
        with connection.cursor() as cursor:
            _purge_expired(cursor, datetime.now(timezone.utc))
            cursor.execute(
                """
                SELECT
                    report_id, created_at, target_kind, target_value,
                    sanitized_message, sanitized_context, status
                FROM report_records AS r
                WHERE report_id = %s
                """,
                (report_id,),
            )
            row = cursor.fetchone()

    if row is None:
        return None

    return StoredReport(
        report_id=row["report_id"],
        created_at=row["created_at"],
        target={"kind": row["target_kind"], "value": row["target_value"]},
        sanitized_message=row["sanitized_message"],
        sanitized_context=row["sanitized_context"],
        status=row["status"],
    )


def update_report_status(
    connection: psycopg.Connection[Any],
    report_id: UUID,
    new_status: ReportStatus,
) -> bool:
    """Actualiza estado y auditoría atómicamente; devuelve False si no existe."""
    with connection.transaction():
        with connection.cursor() as cursor:
            _purge_expired(cursor, datetime.now(timezone.utc))
            cursor.execute(
                """
                SELECT status
                FROM report_records
                WHERE report_id = %s
                FOR UPDATE
                """,
                (report_id,),
            )
            row: Mapping[str, Any] | None = cursor.fetchone()
            if row is None:
                return False

            previous_status = row["status"]
            if previous_status == new_status.value:
                return True

            cursor.execute(
                "UPDATE report_records SET status = %s WHERE report_id = %s",
                (new_status.value, report_id),
            )
            cursor.execute(
                """
                INSERT INTO report_status_audit (
                    report_id, previous_status, new_status
                ) VALUES (%s, %s, %s)
                """,
                (report_id, previous_status, new_status.value),
            )
    return True


def purge_expired_abuse_identifiers(
    connection: psycopg.Connection[Any],
    *,
    now: datetime | None = None,
) -> int:
    """Elimina seudónimos expirados sin borrar los reportes saneados."""
    cutoff = now or datetime.now(timezone.utc)
    with connection.transaction():
        with connection.cursor() as cursor:
            return _purge_expired(cursor, cutoff)


def _purge_expired(cursor: Any, cutoff: datetime) -> int:
    """Elimina solo los identificadores vencidos; conserva reporte y auditoría."""
    cursor.execute(
        "DELETE FROM report_abuse_identifiers WHERE expires_at <= %s",
        (cutoff,),
    )
    return cursor.rowcount
