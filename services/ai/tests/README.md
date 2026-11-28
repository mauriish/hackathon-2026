# Pruebas unitarias de IA

Las pruebas unitarias y documentación específica de `services/ai/` pertenecen
a su propietario. No se ha elegido un framework de pruebas.

`test_provider.py` usa únicamente `unittest` y mocks de transporte; se ejecuta
con `python -m unittest services.ai.tests.test_provider` desde la raíz del
repositorio y no requiere una API key ni acceso de red.
