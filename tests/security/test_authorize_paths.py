"""Pruebas del control de autorización de rutas de pull requests."""

import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "authorize_paths", ROOT / ".github" / "scripts" / "authorize_paths.py"
)
authorize_paths = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(authorize_paths)


def entries(*paths, status="modified"):
    return [{"filename": path, "status": status} for path in paths]


class AuthorizationTests(unittest.TestCase):
    def check(self, actor, changes, *, base="release/v1", head="feature/v1/task",
              base_repo="org/repo", head_repo="org/repo", count=None):
        return authorize_paths.authorize(
            actor, base, head, base_repo, head_repo, changes,
            len(changes) if count is None else count,
        )

    def test_allows_owner_within_assigned_module(self):
        self.assertTrue(self.check(
            "saulfsd98-cloud", entries("apps/web/analysis/README.md")
        )[0])

    def test_rejects_path_outside_assigned_module(self):
        allowed, _ = self.check(
            "saulfsd98-cloud",
            entries("apps/web/analysis/README.md", "services/api/routes/README.md"),
        )
        self.assertFalse(allowed)

    def test_rejects_unknown_user(self):
        self.assertFalse(self.check(
            "unknown", entries("apps/web/README.md")
        )[0])

    def test_rename_checks_old_and_new_paths(self):
        changes = [{
            "filename": "apps/web/new.md",
            "previous_filename": "services/api/old.md",
            "status": "renamed",
        }]
        self.assertFalse(self.check("saulfsd98-cloud", changes)[0])
        self.assertFalse(self.check("ivanrome2303", changes)[0])
        self.assertTrue(self.check("mauriish", changes)[0])

    def test_deleted_file_is_still_authorized_by_its_path(self):
        self.assertTrue(self.check(
            "ivanrome2303", entries("services/api/old.md", status="removed")
        )[0])
        self.assertFalse(self.check(
            "saulfsd98-cloud", entries("services/api/old.md", status="removed")
        )[0])

    def test_rejects_incomplete_file_list(self):
        self.assertFalse(self.check(
            "mauriish", entries("apps/web/a"), count=2
        )[0])
        self.assertFalse(self.check("mauriish", [], count=0)[0])

    def test_pr_recovery_errors_fail_closed(self):
        with self.assertRaises(ValueError):
            authorize_paths.flatten_pages({"message": "API unavailable"})
        with self.assertRaises(ValueError):
            authorize_paths.changed_paths([{"status": "modified"}])

    def test_accepts_valid_protected_branch_promotions(self):
        self.assertTrue(self.check(
            "ivanrome2303", entries("services/api/a"),
            base="development", head="release/v1",
        )[0])
        self.assertTrue(self.check(
            "saulfsd98-cloud", entries("apps/web/a"),
            base="main", head="development",
        )[0])

    def test_feature_to_release_is_not_an_integration_bypass(self):
        self.assertFalse(authorize_paths.is_integration(
            "release/v1", "feature/v1/task", "org/repo", "org/repo"
        ))
        self.assertFalse(self.check(
            "saulfsd98-cloud", entries("services/api/a")
        )[0])

    def test_rejects_wrong_or_external_integration_source(self):
        self.assertFalse(self.check(
            "mauriish", entries("README.md"),
            base="main", head="release/v1",
        )[0])
        self.assertFalse(self.check(
            "mauriish", entries("README.md"),
            base="main", head="development", head_repo="fork/repo",
        )[0])

    def test_integration_pr_does_not_bypass_auth_mechanism_protection(self):
        for path in (
            ".github/CODEOWNERS",
            ".github/scripts/authorize_paths.py",
            ".github/workflows/ownership.yml",
            ".github/workflows/checks.yml",
        ):
            with self.subTest(path=path):
                self.assertFalse(self.check(
                    "saulfsd98-cloud", entries(path),
                    base="main", head="development",
                )[0])

    def test_shared_files_require_project_leader(self):
        self.assertFalse(self.check(
            "ivanrome2303", entries("opencode.json")
        )[0])
        self.assertTrue(self.check(
            "mauriish", entries("opencode.json")
        )[0])

    def test_feature_source_must_match_target_release(self):
        self.assertFalse(self.check(
            "ivanrome2303", entries("services/api/a"),
            base="release/v2", head="feature/v1/task",
        )[0])

    def test_normalizes_and_rejects_path_traversal(self):
        self.assertFalse(self.check(
            "mauriish", entries("../outside.txt")
        )[0])


if __name__ == "__main__":
    unittest.main()
