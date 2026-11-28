# Pruebas unitarias de IA

Las pruebas unitarias y documentación específica de `services/ai/` pertenecen
a su propietario. No se ha elegido un framework de pruebas.

Las pruebas usan únicamente `unittest` y dobles locales; se ejecutan desde la
raíz del repositorio y no requieren una API key ni acceso de red:

```bash
python -m unittest services.ai.tests.test_provider
python -m unittest services.ai.tests.test_social_engineering
python -m unittest services.ai.tests.test_extraction
```
