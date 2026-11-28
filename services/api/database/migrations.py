"""Aplicación transaccional de migraciones SQL versionadas."""

from pathlib import Path

from psycopg import Connection

MIGRATIONS_DIR = Path(__file__).with_name("migrations")


def apply_migrations(connection: Connection) -> tuple[str, ...]:
    """Aplica una sola vez y en orden las migraciones pendientes."""
    applied: list[str] = []
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS api_schema_migrations (
                    version TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    for migration_path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = migration_path.name
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT 1 FROM api_schema_migrations WHERE version = %s",
                    (version,),
                )
                if cursor.fetchone() is not None:
                    continue

                cursor.execute(
                    migration_path.read_text(encoding="utf-8"),
                    prepare=False,
                )
                cursor.execute(
                    "INSERT INTO api_schema_migrations (version) VALUES (%s)",
                    (version,),
                )
                applied.append(version)

    return tuple(applied)
