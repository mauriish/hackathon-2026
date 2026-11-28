"""Comandos para administración local de la base de datos."""

import os
import sys

from database.migrations import apply_migrations
from database.repository import connect


def main() -> int:
    """Aplica migraciones con la URL configurada externamente."""
    if len(sys.argv) != 2 or sys.argv[1] != "migrate":
        print("Uso: python -m database.cli migrate", file=sys.stderr)
        return 2

    database_url = os.getenv("API_DATABASE_URL")
    if not database_url:
        print("Falta configurar API_DATABASE_URL", file=sys.stderr)
        return 2

    with connect(database_url) as connection:
        applied = apply_migrations(connection)

    if applied:
        print(f"Migraciones aplicadas: {', '.join(applied)}")
    else:
        print("La base de datos ya está actualizada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
