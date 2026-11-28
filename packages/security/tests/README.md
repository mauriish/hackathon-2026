# Pruebas unitarias de seguridad

Pruebas específicas del paquete `packages/security/`; su propietaria mantiene
también la documentación asociada. Pytest está disponible en el stack oficial.

```bash
python -m pytest packages/security/tests -q
```

Estas pruebas son unitarias: no usan red, bases de datos ni servicios externos.
El workflow actual de GitHub Actions solo ejecuta las pruebas generales de
`tests/security/`; las pruebas de este directorio se ejecutan localmente hasta
que se acuerde incorporarlas a CI.
