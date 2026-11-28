import pytest

from packages.security.identity import (
    IdentityRating,
    IdentityRatingResult,
    UrlStatus,
    rate_identity,
)


def test_exact_catalog_match_is_explained():
    result = rate_identity(
        ["https://www.example.org/login"], {"www.example.org"}
    )

    assert result.rating is IdentityRating.MATCHED
    assert "coincide exactamente" in result.explanation
    assert result.evidence[0].host == "www.example.org"


def test_unknown_domain_is_not_treated_as_fraud():
    result = rate_identity(["https://unknown.example/login"], {"known.example"})

    assert result.rating is IdentityRating.UNMATCHED
    assert "no constituye por sí solo evidencia de fraude" in result.explanation


def test_missing_or_invalid_evidence_is_insufficient():
    missing = rate_identity(None, {"known.example"})
    invalid = rate_identity(["javascript:alert(1)"], {"known.example"})
    unavailable_catalog = rate_identity(["https://unknown.example"], set())

    assert missing.rating is IdentityRating.INSUFFICIENT
    assert missing.evidence == ()
    assert invalid.rating is IdentityRating.INSUFFICIENT
    assert invalid.evidence[0].status.value == "invalid"
    assert unavailable_catalog.rating is IdentityRating.INSUFFICIENT


def test_known_match_wins_when_evidence_contains_unknown_urls():
    result = rate_identity(
        ["https://unknown.example", "https://known.example/path"],
        {"known.example"},
    )

    assert result.rating is IdentityRating.MATCHED


def test_empty_evidence_is_insufficient():
    result = rate_identity([], {"known.example"})

    assert result.rating is IdentityRating.INSUFFICIENT
    assert result.evidence == ()
    assert "No hay URLs válidas" in result.explanation


@pytest.mark.parametrize(
    "catalog",
    [None, set(), {None, ""}, {"###", "http://["}],
)
def test_unusable_catalog_is_insufficient(catalog):
    result = rate_identity(["https://known.example/login"], catalog)

    assert result.rating is IdentityRating.INSUFFICIENT
    assert "catálogo" in result.explanation
    assert result.evidence[0].status is UrlStatus.UNKNOWN


def test_single_url_and_string_catalog_are_supported():
    result = rate_identity("https://known.example/path", "known.example")

    assert result.rating is IdentityRating.MATCHED
    assert len(result.evidence) == 1
    assert result.evidence[0].host == "known.example"


def test_non_string_evidence_does_not_hide_valid_match():
    result = rate_identity(
        [None, 123, "javascript:alert(1)", "https://known.example/ruta"],
        {"known.example"},
    )

    assert result.rating is IdentityRating.MATCHED
    assert any(item.status is UrlStatus.INVALID for item in result.evidence)
    assert any(item.status is UrlStatus.KNOWN for item in result.evidence)


def test_unmatched_requires_usable_catalog_and_keeps_no_fraud_wording():
    result = rate_identity(
        ["javascript:alert(1)", "https://unknown.example/login"],
        {"known.example"},
    )

    assert result.rating is IdentityRating.UNMATCHED
    assert "no constituye por sí solo evidencia de fraude" in result.explanation


def test_unordered_evidence_produces_repeatable_result():
    urls = {"https://unknown.example", "https://known.example/path"}
    catalog = {"known.example"}

    first = rate_identity(urls, catalog)
    second = rate_identity(urls, catalog)

    assert first == second
    assert first.rating is IdentityRating.MATCHED
    assert [item.status for item in first.evidence] == [
        UrlStatus.KNOWN,
        UrlStatus.UNKNOWN,
    ]


@pytest.mark.parametrize(
    ("urls", "catalog", "expected_rating", "expected_score"),
    [
        (["https://known.example"], {"known.example"}, IdentityRating.MATCHED, 0),
        (["https://unknown.example"], {"known.example"}, IdentityRating.UNMATCHED, 20),
        (None, {"known.example"}, IdentityRating.INSUFFICIENT, None),
        (["https://known.example"], None, IdentityRating.INSUFFICIENT, None),
    ],
)
def test_score_matches_agreed_mapping(
    urls, catalog, expected_rating, expected_score
):
    result = rate_identity(urls, catalog)

    assert result.rating is expected_rating
    assert result.score == expected_score


def test_score_defaults_to_none_for_external_constructions():
    result = IdentityRatingResult(IdentityRating.MATCHED, "Motivo", ())

    assert result.rating is IdentityRating.MATCHED
    assert result.score is None
