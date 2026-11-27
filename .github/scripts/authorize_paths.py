#!/usr/bin/env python3
"""Valida propiedad de rutas y procedencia de PR; falla cerrado."""

import argparse
import json
import re
import sys
from pathlib import PurePosixPath
from typing import Any

OWNERS = {
    "saulfsd98-cloud": ("apps/web/",),
    "ivanrome2303": ("services/api/",),
    "chedooo": ("services/ai/",),
    "aguillonmarthaguadalupe-lab": ("packages/security/", "tests/"),
}
AUTH_FILES = (
    ".github/CODEOWNERS",
    ".github/scripts/authorize_paths.py",
    ".github/workflows/checks.yml",
    ".github/workflows/ownership.yml",
)


def normalize(path: str) -> str:
    """Rechaza rutas absolutas, traversal y separadores ambiguos."""
    path = path.replace("\\", "/")
    pure = PurePosixPath(path)
    if (
        not path
        or "\0" in path
        or pure.is_absolute()
        or re.match(r"^[A-Za-z]:/", path)
        or ".." in pure.parts
    ):
        raise ValueError(f"Ruta inválida recibida de GitHub: {path!r}")
    return str(pure)


def is_integration(base: str, head: str, base_repo: str, head_repo: str) -> bool:
    """Solo permite promociones release->development y development->main."""
    if not base_repo or base_repo.casefold() != head_repo.casefold():
        return False
    if base == "main":
        return head == "development"
    if base == "development":
        return re.fullmatch(r"release/[^/]+", head) is not None
    return False


def is_protected_base(branch: str) -> bool:
    return branch in ("main", "development") or branch.startswith("release/")


def changed_paths(entries: list[dict[str, Any]]) -> set[str]:
    """Incluye ambos lados de renombres y todos los estados (incluidos deletes)."""
    result: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict) or not isinstance(entry.get("filename"), str):
            raise ValueError("La API devolvió una entrada de archivo inválida.")
        result.add(normalize(entry["filename"]))
        previous = entry.get("previous_filename")
        if previous is not None:
            if not isinstance(previous, str):
                raise ValueError("previous_filename inválido en respuesta de GitHub.")
            result.add(normalize(previous))
    return result


def flatten_pages(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, list):
        raise ValueError("La respuesta paginada debe ser una lista JSON.")
    if all(isinstance(item, dict) for item in payload):
        return payload
    flattened: list[dict[str, Any]] = []
    for page in payload:
        if not isinstance(page, list) or not all(isinstance(item, dict) for item in page):
            raise ValueError("Formato de páginas de archivos inválido.")
        flattened.extend(page)
    return flattened


def authorize(
    actor: str,
    base: str,
    head: str,
    base_repo: str,
    head_repo: str,
    entries: list[dict[str, Any]],
    expected_count: int,
) -> tuple[bool, str]:
    if expected_count < 0 or len(entries) != expected_count:
        return False, (
            f"Lista incompleta: API indica {expected_count} archivos y "
            f"se recibieron {len(entries)}."
        )
    if not entries:
        return False, "La lista de archivos está vacía; no se puede autorizar el PR."

    try:
        paths = changed_paths(entries)
    except (TypeError, ValueError) as error:
        return False, str(error)

    actor_key = actor.casefold()
    protected_changed = sorted(paths.intersection(AUTH_FILES))
    if protected_changed and actor_key != "mauriish":
        return False, (
            "Los archivos del mecanismo de autorización solo pueden cambiar "
            "mediante PR de @mauriish con revisión humana."
        )

    if is_integration(base, head, base_repo, head_repo):
        return True, f"Promoción autorizada: {head} -> {base}."

    if is_protected_base(base):
        if base in ("main", "development"):
            return False, f"Origen no autorizado para la rama protegida {base}."
        release_match = re.fullmatch(r"release/(v[^/]+)", base)
        if release_match is None:
            return False, f"Origen no autorizado para la rama protegida {base}."
        if not re.fullmatch(
            rf"feature/{re.escape(release_match.group(1))}/[^/]+", head
        ):
            return False, f"El PR a {base} debe provenir de su feature correspondiente."

    if actor_key == "mauriish":
        return True, f"Rutas autorizadas para @{actor}."
    prefixes = OWNERS.get(actor_key)
    if prefixes is None:
        return False, f"Usuario de GitHub desconocido: @{actor}."

    unauthorized = sorted(
        path for path in paths
        if not any(path.startswith(prefix) for prefix in prefixes)
    )
    if unauthorized:
        return False, "Rutas fuera de propiedad: " + ", ".join(unauthorized)
    return True, f"{len(entries)} archivos autorizados para @{actor}."


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--actor", required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--base-repo", required=True)
    parser.add_argument("--head-repo", required=True)
    parser.add_argument("--changed-files", required=True, type=int)
    parser.add_argument("--files-json", required=True)
    args = parser.parse_args()
    try:
        with open(args.files_json, encoding="utf-8") as source:
            entries = flatten_pages(json.load(source))
        ok, message = authorize(
            args.actor, args.base, args.head, args.base_repo, args.head_repo,
            entries, args.changed_files,
        )
    except (OSError, json.JSONDecodeError, TypeError, ValueError) as error:
        print(f"::error::No se pudo verificar autorización: {error}")
        return 1
    print(message if ok else f"::error::{message}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
