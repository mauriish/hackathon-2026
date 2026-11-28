"""Pruebas de redacción determinista de datos sensibles."""

from reports.sanitization import sanitize_text


def test_sanitize_text_removes_sensitive_patterns_and_url_secrets() -> None:
    sanitized = sanitize_text(
        "Correo ana.lopez@example.invalid; nombre: Ana López; "
        "contraseña=secreto-123; visita "
        "https://usuario:clave@example.invalid/alerta?access_token=privado#sesion."
    )

    assert "ana.lopez@example.invalid" not in sanitized
    assert "Ana López" not in sanitized
    assert "secreto-123" not in sanitized
    assert "usuario:clave" not in sanitized
    assert "access_token" not in sanitized
    assert "privado" not in sanitized
    assert "sesion" not in sanitized
    assert "https://example.invalid/alerta" in sanitized


def test_sanitize_text_redacts_phone_and_card_numbers() -> None:
    sanitized = sanitize_text(
        "Teléfono +52 442 123 4567; tarjeta 4111 1111 1111 1111"
    )

    assert "442 123 4567" not in sanitized
    assert "4111 1111 1111 1111" not in sanitized
