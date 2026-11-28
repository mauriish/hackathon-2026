"""Pruebas unitarias de deduplicación y prevención de data poisoning."""

import importlib
import re
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

anti_abuse = importlib.import_module("packages.security.anti-abuse")

Deduplicator = anti_abuse.Deduplicator
InMemoryFingerprintStore = anti_abuse.InMemoryFingerprintStore
compute_fingerprint = anti_abuse.compute_fingerprint

SENSITIVE_VALUES = (
    "198.51.100.23",
    "juan.perez@example.com",
    "turnstile-token",
    "clave-secreta",
)


def _report(**overrides):
    """Datos ficticios ya saneados, independientes para cada prueba."""
    report = {
        "target_kind": "link",
        "target_value": "ejemplo.mx/estafa",
        "sanitized_message": "Piden pago anticipado por un servicio falso",
        "sanitized_context": "Difundido en redes sociales",
    }
    report.update(overrides)
    return report


def test_la_huella_es_determinista_y_solo_contiene_hexadecimal():
    fingerprint = compute_fingerprint(**_report())

    assert fingerprint == compute_fingerprint(**_report())
    assert re.fullmatch(r"[0-9a-f]{64}", fingerprint)


def test_el_primer_reporte_se_acepta_y_el_duplicado_no_suma():
    store = InMemoryFingerprintStore()
    deduplicator = Deduplicator(store)

    first = deduplicator.evaluate(**_report())
    second = deduplicator.evaluate(**_report())

    assert first.accepted and not first.duplicate
    assert not second.accepted and second.duplicate
    assert first.fingerprint == second.fingerprint
    assert len(store.fingerprints) == 1


def test_variaciones_de_espacios_y_mayusculas_no_crean_otro_reporte():
    deduplicator = Deduplicator()

    first = deduplicator.evaluate(**_report())
    variant = deduplicator.evaluate(
        **_report(
            sanitized_message="  Piden  PAGO anticipado por un servicio falso  ",
            sanitized_context="DIFUNDIDO en redes sociales",
        )
    )

    assert variant.duplicate
    assert not variant.accepted
    assert variant.fingerprint == first.fingerprint


def test_contenido_saneado_distinto_no_es_duplicado():
    deduplicator = Deduplicator()

    first = deduplicator.evaluate(**_report())
    other = deduplicator.evaluate(
        **_report(sanitized_message="Ofrecen una recompensa falsa")
    )

    assert not other.duplicate and other.accepted
    assert other.fingerprint != first.fingerprint


def test_destinos_distintos_no_se_consideran_duplicados():
    deduplicator = Deduplicator()

    first = deduplicator.evaluate(**_report())
    other = deduplicator.evaluate(**_report(target_value="otro-sitio.mx/estafa"))

    assert not other.duplicate and other.accepted
    assert other.fingerprint != first.fingerprint


def test_la_decision_y_el_almacen_no_exponen_datos_sensibles():
    store = InMemoryFingerprintStore()

    decision = Deduplicator(store).evaluate(**_report())
    serializado = repr(decision) + "".join(store.fingerprints)

    for sensible in SENSITIVE_VALUES:
        assert sensible not in serializado
    assert all(
        re.fullmatch(r"[0-9a-f]{64}", fingerprint)
        for fingerprint in store.fingerprints
    )


def test_los_estados_de_dos_deduplicadores_estan_aislados():
    first = Deduplicator().evaluate(**_report())
    second = Deduplicator().evaluate(**_report())

    assert first.accepted and second.accepted
    assert first.fingerprint == second.fingerprint


def test_toda_decision_requiere_validacion_independiente_y_no_publica():
    deduplicator = Deduplicator()

    decisions = (
        deduplicator.evaluate(**_report()),
        deduplicator.evaluate(**_report()),
    )

    for decision in decisions:
        assert decision.status == "pending"
        assert decision.requires_independent_validation is True
        assert decision.publication_allowed is False


def test_acepta_un_almacen_inyectable():
    class StoreSpy:
        def __init__(self) -> None:
            self.added: list[str] = []

        def contains(self, fingerprint: str) -> bool:
            return fingerprint in self.added

        def add(self, fingerprint: str) -> None:
            self.added.append(fingerprint)

    spy = StoreSpy()
    decision = Deduplicator(spy).evaluate(**_report())

    assert spy.added == [decision.fingerprint]


@pytest.mark.parametrize(
    "overrides",
    (
        {"target_kind": "url"},
        {"target_value": "   "},
        {"sanitized_message": "   "},
    ),
)
def test_rechaza_entradas_sin_saneamiento(overrides):
    with pytest.raises(ValueError):
        compute_fingerprint(**_report(**overrides))
