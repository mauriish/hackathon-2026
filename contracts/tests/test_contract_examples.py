"""Valida ejemplos positivos y negativos contra los contratos JSON Schema."""

import json
from math import isclose
from pathlib import Path
from typing import Any

import pytest
from jsonschema import Draft202012Validator


CONTRACTS_DIR = Path(__file__).parents[1]
SCHEMA_PATH = CONTRACTS_DIR / "schemas" / "v1" / "contracts.schema.json"
EXAMPLES_DIR = CONTRACTS_DIR / "examples" / "v1"

with SCHEMA_PATH.open(encoding="utf-8") as schema_file:
    CONTRACTS_SCHEMA: dict[str, Any] = json.load(schema_file)

ROOT_VALIDATOR = Draft202012Validator(
    CONTRACTS_SCHEMA,
    format_checker=Draft202012Validator.FORMAT_CHECKER,
)


def load_example(filename: str) -> dict[str, Any]:
    with (EXAMPLES_DIR / filename).open(encoding="utf-8") as example_file:
        return json.load(example_file)


def validator_for(contract_name: str) -> Draft202012Validator:
    schema = {
        "$schema": CONTRACTS_SCHEMA["$schema"],
        "$defs": CONTRACTS_SCHEMA["$defs"],
        "$ref": f"#/$defs/{contract_name}",
    }
    return Draft202012Validator(
        schema,
        format_checker=Draft202012Validator.FORMAT_CHECKER,
    )


def has_valid_dynamic_weights(check: dict[str, Any]) -> bool:
    signals = check["signals"].values()
    available = [signal for signal in signals if signal["status"] == "available"]
    unavailable = [signal for signal in signals if signal["status"] == "unavailable"]

    if any(signal["score"] is not None or signal["weight"] != 0 for signal in unavailable):
        return False
    if not available:
        return check["risk_score"] is None and check["risk_level"] == "no_concluyente"

    if not isclose(sum(signal["weight"] for signal in available), 1, abs_tol=1e-9):
        return False

    weighted_score = sum(signal["score"] * signal["weight"] for signal in available)
    return isclose(check["risk_score"], weighted_score, abs_tol=1e-9)


@pytest.mark.parametrize(
    ("contract_name", "filename"),
    [
        ("ReportSubmission", "report-submission.valid.json"),
        ("ReportRecord", "report-record.valid.json"),
        ("AnalysisRequest", "analysis-request.valid.json"),
        ("AiAssessment", "ai-assessment.valid.json"),
        ("Evidence", "evidence.valid.json"),
        ("Check", "check.valid.json"),
        ("Check", "check-inconclusive.valid.json"),
        ("ApiError", "api-error.valid.json"),
    ],
)
def test_valid_examples_match_their_contract(contract_name: str, filename: str) -> None:
    assert validator_for(contract_name).is_valid(load_example(filename))


@pytest.mark.parametrize(
    ("contract_name", "filename"),
    [
        ("ReportSubmission", "report-submission.invalid.json"),
        ("ReportRecord", "report-record.invalid.json"),
        ("AnalysisRequest", "analysis-request.invalid.json"),
        ("AiAssessment", "ai-assessment.invalid.json"),
        ("Evidence", "evidence.invalid.json"),
        ("Check", "check.invalid.json"),
        ("ApiError", "api-error.invalid.json"),
    ],
)
def test_invalid_examples_are_rejected(contract_name: str, filename: str) -> None:
    assert not validator_for(contract_name).is_valid(load_example(filename))


def test_schema_document_is_valid_json_schema() -> None:
    Draft202012Validator.check_schema(CONTRACTS_SCHEMA)


@pytest.mark.parametrize(
    "filename",
    [
        "report-submission.valid.json",
        "report-record.valid.json",
        "analysis-request.valid.json",
        "ai-assessment.valid.json",
        "evidence.valid.json",
        "check.valid.json",
        "check-inconclusive.valid.json",
        "api-error.valid.json",
    ],
)
def test_valid_contracts_match_the_bundle_root(filename: str) -> None:
    assert ROOT_VALIDATOR.is_valid(load_example(filename))


def test_unavailable_signal_has_no_score_or_weight() -> None:
    check = load_example("check-inconclusive.valid.json")

    for signal in check["signals"].values():
        if signal["status"] == "unavailable":
            assert signal["score"] is None
            assert signal["weight"] == 0


def test_final_score_matches_weighted_signal_scores() -> None:
    assert has_valid_dynamic_weights(load_example("check.valid.json"))


def test_available_weights_are_redistributed_to_sum_to_one() -> None:
    check = load_example("check.valid.json")
    check["signals"]["identity"]["weight"] = 0.2

    assert not has_valid_dynamic_weights(check)


def test_unavailable_signal_weight_is_redistributed() -> None:
    check = load_example("check.valid.json")
    check["signals"]["community"] = {
        "status": "unavailable",
        "score": None,
        "weight": 0,
    }
    check["signals"]["ai"]["weight"] = 0.7
    check["signals"]["identity"]["weight"] = 0.3
    check["risk_score"] = 67

    assert validator_for("Check").is_valid(check)
    assert has_valid_dynamic_weights(check)


def test_no_available_signals_produce_no_conclusive_score() -> None:
    check = load_example("check-inconclusive.valid.json")
    assert has_valid_dynamic_weights(check)


def test_gemini_unavailable_cannot_return_a_conclusive_check() -> None:
    check = load_example("check.valid.json")
    check["providers"][0]["status"] = "unavailable"
    check["providers"][0]["error"] = {
        "contract_type": "ApiError",
        "code": "provider_unavailable",
        "message": "Gemini no está disponible.",
        "retryable": True,
        "provider": "gemini",
    }

    assert not validator_for("Check").is_valid(check)


def test_report_record_abuse_identifier_expires_after_fourteen_days() -> None:
    from datetime import datetime, timedelta

    report = load_example("report-record.valid.json")
    created_at = datetime.fromisoformat(report["created_at"].replace("Z", "+00:00"))
    expires_at = datetime.fromisoformat(
        report["abuse_id_expires_at"].replace("Z", "+00:00")
    )

    assert expires_at - created_at == timedelta(days=14)


def test_sanitized_link_rejects_credentials_query_and_fragment() -> None:
    validator = validator_for("SanitizedTarget")

    assert not validator.is_valid(
        {"kind": "link", "value": "https://user:pass@example.invalid/path"}
    )
    assert not validator.is_valid(
        {"kind": "link", "value": "https://example.invalid/path?token=secret"}
    )
    assert not validator.is_valid(
        {"kind": "link", "value": "https://example.invalid/path#fragment"}
    )


@pytest.mark.parametrize(
    ("score", "risk_level"),
    [
        (19.99, "sin_senales_importantes"),
        (20, "riesgo_moderado"),
        (59.99, "riesgo_moderado"),
        (60, "riesgo_alto"),
    ],
)
def test_risk_level_boundaries(score: float, risk_level: str) -> None:
    check = load_example("check.valid.json")
    check["risk_score"] = score
    check["risk_level"] = risk_level

    assert validator_for("Check").is_valid(check)


def test_openapi_references_the_shared_contract_schemas() -> None:
    openapi_path = CONTRACTS_DIR / "openapi" / "v1.json"
    with openapi_path.open(encoding="utf-8") as openapi_file:
        openapi = json.load(openapi_file)

    schemas = openapi["components"]["schemas"]
    for name in (
        "ReportSubmission",
        "Target",
        "SanitizedTarget",
        "ReportRecord",
        "AnalysisRequest",
        "AiAssessment",
        "Evidence",
        "RatingSignal",
        "ProviderStatus",
        "Check",
        "ApiError",
    ):
        reference = schemas[name]["$ref"]
        assert reference.startswith("../schemas/v1/contracts.schema.json#/$defs/")
        assert reference.endswith(f"/{name}")
