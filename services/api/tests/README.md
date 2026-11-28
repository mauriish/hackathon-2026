# Pruebas del API

Las pruebas de `services/api/` usan Pytest. Desde `services/api/`, ejecuta:

```bash
python -m pytest
```

Las pruebas unitarias no requieren servicios externos. Las pruebas de
persistencia usan una base PostgreSQL aislada mediante `API_TEST_DATABASE_URL`;
el nombre de la base debe terminar en `_test`. La suite falla de forma segura
si la variable apunta a una base con otro nombre. Nunca uses una base de
producción.

GitHub Actions provisiona un PostgreSQL temporal para cada ejecución y ejecuta
la suite completa del API.
