from packages.security.identity import IdentityRating, rate_identity


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
