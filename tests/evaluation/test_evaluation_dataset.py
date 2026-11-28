"""Valida el dataset sintético de evaluación H26-33 contra los contratos públicos."""

import hashlib
import json
import re
import uuid
from collections import Counter
from datetime import datetime, timedelta
from math import isclose
from pathlib import Path
from typing import Any, Iterator

import pytest
from jsonschema import Draft202012Validator


EVAL_DIR = Path(__file__).resolve().parent
ROOT = EVAL_DIR.parents[1]
DATASET_PATH = EVAL_DIR / "datasets" / "evaluation-cases.json"
DATASET_SCHEMA_PATH = EVAL_DIR / "schemas" / "evaluation-dataset.schema.json"
CONTRACTS_SCHEMA_PATH = (
    ROOT / "contracts" / "schemas" / "v1" / "contracts.schema.json"
)

CATEGORIES = ("benigno", "sospechoso", "ambiguo", "error")
CATEGORY_PREFIXES = {
    "benigno": "BEN",
    "sospechoso": "SOS",
    "ambiguo": "AMB",
    "error": "ERR",
}
FORMAT_CHECKER = Draft202012Validator.FORMAT_CHECKER


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as json_file:
        return json.load(json_file)


DATASET_SCHEMA = load_json(DATASET_SCHEMA_PATH)
CONTRACTS_SCHEMA = load_json(CONTRACTS_SCHEMA_PATH)
DATASET = load_json(DATASET_PATH)
CASES = DATASET["cases"]

DATASET_VALIDATOR = Draft202012Validator(DATASET_SCHEMA)
CONTRACT_VALIDATORS = {
    name: Draft202012Validator(
        {
            "$schema": CONTRACTS_SCHEMA["$schema"],
            "$defs": CONTRACTS_SCHEMA["$defs"],
            "$ref": f"#/$defs/{name}",
        },
        format_checker=FORMAT_CHECKER,
    )
    for name in CONTRACTS_SCHEMA["$defs"]
}


def level_for(score: float | None) -> str:
    if score is None:
        return "no_concluyente"
    if score < 20:
        return "sin_senales_importantes"
    if score < 60:
        return "riesgo_moderado"
    return "riesgo_alto"


def iter_strings(value: Any) -> Iterator[str]:
    if isinstance(value, dict):
        for key, item in value.items():
            yield key
            yield from iter_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from iter_strings(item)
    elif isinstance(value, str):
        yield value


def test_shared_schema_and_local_dataset_schema_are_valid() -> None:
    Draft202012Validator.check_schema(CONTRACTS_SCHEMA)
    Draft202012Validator.check_schema(DATASET_SCHEMA)


def test_dataset_matches_its_schema() -> None:
    errors = sorted(DATASET_VALIDATOR.iter_errors(DATASET), key=lambda error: error.path)
    assert not errors, [error.message for error in errors]


def test_cases_digest_is_reproducible() -> None:
    canonical_cases = json.dumps(
        CASES, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )
    digest = hashlib.sha256(canonical_cases.encode("utf-8")).hexdigest()
    assert digest == DATASET["cases_digest_sha256"]


def test_case_identifiers_are_unique_and_match_their_category() -> None:
    identifiers = [case["id"] for case in CASES]
    assert len(identifiers) == len(set(identifiers))

    for case in CASES:
        assert case["id"].startswith(f"{CATEGORY_PREFIXES[case['category']]}-")


def test_all_categories_are_covered() -> None:
    counts = Counter(case["category"] for case in CASES)
    assert set(counts) == set(CATEGORIES)

    for category in CATEGORIES:
        assert counts[category] >= 3


@pytest.mark.parametrize("case", CASES, ids=[case["id"] for case in CASES])
def test_payload_validity_matches_expected(case: dict[str, Any]) -> None:
    validator = CONTRACT_VALIDATORS[case["contract"]]
    assert validator.is_valid(case["payload"]) is case["expected"]["valid_against_contract"]


@pytest.mark.parametrize("case", CASES, ids=[case["id"] for case in CASES])
def test_expected_contract_type_matches_payload(case: dict[str, Any]) -> None:
    if "contract_type" in case["expected"]:
        assert case["payload"]["contract_type"] == case["expected"]["contract_type"]


VALID_CHECKS = [
    case
    for case in CASES
    if case["contract"] == "Check" and case["expected"]["valid_against_contract"]
]


@pytest.mark.parametrize("case", VALID_CHECKS, ids=[case["id"] for case in VALID_CHECKS])
def test_check_expectations_follow_weighting_rules(case: dict[str, Any]) -> None:
    payload = case["payload"]
    expected = case["expected"]
    signals = payload["signals"]

    available = {
        name: signal
        for name, signal in signals.items()
        if signal["status"] == "available"
    }
    unavailable = [
        signal for signal in signals.values() if signal["status"] == "unavailable"
    ]

    for signal in unavailable:
        assert signal["score"] is None
        assert signal["weight"] == 0

    assert set(available) == set(expected["available_signals"])
    if available:
        assert isclose(
            sum(signal["weight"] for signal in available.values()), 1, abs_tol=1e-9
        )

    gemini_unavailable = any(
        provider["provider"] == "gemini" and provider["status"] == "unavailable"
        for provider in payload["providers"]
    )

    if gemini_unavailable or not available:
        assert payload["risk_score"] is None
        assert payload["risk_level"] == "no_concluyente"
        assert payload["status"] in ("inconclusive", "failed")
        assert expected["risk_score"] is None
        assert expected["risk_level"] == "no_concluyente"
        assert expected["status"] in ("inconclusive", "failed")
        return

    weighted_score = sum(
        signal["score"] * signal["weight"] for signal in available.values()
    )
    assert isclose(weighted_score, expected["risk_score"], abs_tol=1e-9)
    assert isclose(payload["risk_score"], expected["risk_score"], abs_tol=1e-9)
    assert payload["risk_level"] == expected["risk_level"] == level_for(weighted_score)
    assert payload["status"] == expected["status"] == "completed"


VALID_AI_ASSESSMENTS = [
    case
    for case in CASES
    if case["contract"] == "AiAssessment"
    and case["expected"]["valid_against_contract"]
]


@pytest.mark.parametrize(
    "case", VALID_AI_ASSESSMENTS, ids=[case["id"] for case in VALID_AI_ASSESSMENTS]
)
def test_ai_assessment_expectations_follow_risk_levels(case: dict[str, Any]) -> None:
    payload = case["payload"]
    expected = case["expected"]

    assert payload["risk_score"] == expected["risk_score"]
    assert payload["risk_level"] == expected["risk_level"]
    assert payload["risk_level"] == level_for(expected["risk_score"])


def test_report_record_uses_fixed_identifiers_and_fourteen_day_alias() -> None:
    records = [case for case in CASES if case["contract"] == "ReportRecord"]

    for case in records:
        payload = case["payload"]
        created_at = datetime.fromisoformat(payload["created_at"].replace("Z", "+00:00"))
        expires_at = datetime.fromisoformat(
            payload["abuse_id_expires_at"].replace("Z", "+00:00")
        )
        assert expires_at - created_at == timedelta(days=14)
        assert uuid.UUID(payload["report_id"]).version == 4


def test_fixtures_do_not_include_personal_data_or_real_hosts() -> None:
    email_pattern = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
    url_pattern = re.compile(r"https?://([^/\s?#]+)")

    for case in CASES:
        strings = list(iter_strings(case["payload"]))
        for value in strings:
            assert not email_pattern.search(value), case["id"]

            for match in url_pattern.finditer(value):
                host = match.group(1).rsplit("@", 1)[-1].split(":", 1)[0]
                assert host.endswith(".invalid"), case["id"]


def test_identifiers_are_deterministic_uuid_v4() -> None:
    for case in CASES:
        payload = case["payload"]
        for field in ("check_id", "report_id"):
            if field in payload:
                assert uuid.UUID(payload[field]).version == 4, case["id"]
