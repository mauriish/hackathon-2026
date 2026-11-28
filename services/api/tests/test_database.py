"""Pruebas de integración de migraciones y persistencia PostgreSQL."""

import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import psycopg
import pytest
from psycopg import sql
from psycopg.rows import dict_row
from pydantic import ValidationError

from database.migrations import apply_migrations
from database.models import ReportRecord, ReportStatus
from database.repository import (
    create_report,
    get_official_identity,
    get_report,
    list_official_identities,
    purge_expired_abuse_identifiers,
    update_report_status,
)

TEST_DATABASE_URL = os.getenv("API_TEST_DATABASE_URL")


@pytest.fixture
def database_connection():
    if not TEST_DATABASE_URL:
        pytest.skip("API_TEST_DATABASE_URL no está configurada")

    connection = psycopg.connect(TEST_DATABASE_URL, row_factory=dict_row)
    database_name = connection.info.dbname or ""
    if not database_name.lower().endswith("_test"):
        connection.close()
        pytest.fail(
            "API_TEST_DATABASE_URL debe apuntar a una base cuyo nombre "
            "termine en _test"
        )

    schema_name = f"api_test_{uuid4().hex}"
    schema_created = False
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema_name))
            )
            schema_created = True
            cursor.execute(
                sql.SQL("SET search_path TO {}").format(sql.Identifier(schema_name))
            )
        connection.commit()
        yield connection
    finally:
        if not connection.closed:
            connection.rollback()
            try:
                if schema_created:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            sql.SQL("DROP SCHEMA IF EXISTS {} CASCADE").format(
                                sql.Identifier(schema_name)
                            )
                        )
                    connection.commit()
            finally:
                connection.close()


def make_report(
    *,
    created_at: datetime | None = None,
    expires_at: datetime | None = None,
) -> ReportRecord:
    created_at = created_at or datetime.now(timezone.utc)
    expires_at = expires_at or created_at + timedelta(days=14)
    return ReportRecord(
        contract_type="ReportRecord",
        report_id=uuid4(),
        created_at=created_at,
        target={"kind": "link", "value": "https://example.com/path"},
        sanitized_message="Mensaje saneado",
        sanitized_context="Contexto general",
        abuse_id="hmac-test-only",
        abuse_id_expires_at=expires_at,
        status=ReportStatus.RECEIVED,
    )


def test_report_model_rejects_abuse_identifier_over_14_days() -> None:
    created_at = datetime.now(timezone.utc)

    with pytest.raises(ValidationError, match="14 días"):
        make_report(
            created_at=created_at,
            expires_at=created_at + timedelta(days=15),
        )


def test_report_model_rejects_turnstile_token_as_unknown_field() -> None:
    record = make_report().model_dump()

    with pytest.raises(ValidationError):
        ReportRecord(**record, turnstile_token="must-not-persist")


def test_migrations_are_reproducible_and_idempotent(database_connection) -> None:
    first_run = apply_migrations(database_connection)
    second_run = apply_migrations(database_connection)

    assert first_run == (
        "001_create_report_storage.sql",
        "002_create_official_identities.sql",
    )
    assert second_run == ()


def test_official_identity_catalog_is_seeded_and_queryable(database_connection) -> None:
    apply_migrations(database_connection)

    identities = list_official_identities(database_connection)
    nasa = get_official_identity(database_connection, "NASA.GOV.")

    assert len(identities) == 10
    assert nasa is not None
    assert nasa.organization == "National Aeronautics and Space Administration (NASA)"
    assert nasa.domain == "nasa.gov"
    assert nasa.source_url.startswith("https://")
    assert get_official_identity(database_connection, "subdomain.nasa.gov") is None
    assert get_official_identity(database_connection, "unknown.example") is None


def test_official_identity_catalog_rejects_duplicate_domains(
    database_connection,
) -> None:
    apply_migrations(database_connection)

    with pytest.raises(psycopg.errors.UniqueViolation):
        with database_connection.transaction():
            with database_connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO official_identities (
                        organization, domain, sector, source_url, verified_at
                    ) VALUES (
                        'Duplicate NASA', 'nasa.gov', 'Test',
                        'https://example.test', DATE '2026-01-01'
                    )
                    """
                )


def test_report_status_is_persisted_and_audited(database_connection) -> None:
    apply_migrations(database_connection)
    record = make_report()

    create_report(database_connection, record)
    assert update_report_status(
        database_connection, record.report_id, ReportStatus.PROCESSING
    )

    persisted = get_report(database_connection, record.report_id)
    assert persisted is not None
    assert persisted.status is ReportStatus.PROCESSING

    with database_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT previous_status, new_status
            FROM report_status_audit
            WHERE report_id = %s
            ORDER BY event_id
            """,
            (record.report_id,),
        )
        events = cursor.fetchall()
    assert events == [
        {"previous_status": None, "new_status": "received"},
        {"previous_status": "received", "new_status": "processing"},
    ]


def test_database_rejects_unknown_status(database_connection) -> None:
    apply_migrations(database_connection)
    record = make_report()
    create_report(database_connection, record)

    with pytest.raises(psycopg.errors.CheckViolation):
        with database_connection.transaction():
            with database_connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE report_records SET status = 'pending' WHERE report_id = %s",
                    (record.report_id,),
                )


def test_database_rejects_abuse_identifier_expiring_after_14_days(
    database_connection,
) -> None:
    apply_migrations(database_connection)
    record = make_report()
    create_report(database_connection, record)

    with pytest.raises(psycopg.errors.CheckViolation):
        with database_connection.transaction():
            with database_connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE report_abuse_identifiers
                    SET expires_at = issued_at + INTERVAL '15 days'
                    WHERE report_id = %s
                    """,
                    (record.report_id,),
                )


def test_expired_abuse_identifier_is_removed_without_deleting_report(
    database_connection,
) -> None:
    apply_migrations(database_connection)
    record = make_report()
    create_report(database_connection, record)
    cutoff = record.abuse_id_expires_at + timedelta(seconds=1)

    assert purge_expired_abuse_identifiers(database_connection, now=cutoff) == 1
    stored = get_report(database_connection, record.report_id)
    assert stored is not None
    assert stored.report_id == record.report_id
