# Pruebas unitarias de seguridad

Pruebas específicas del paquete `packages/security/`; su propietaria mantiene
también la documentación asociada. Se ejecutan con Pytest, ya disponible en el
repositorio para otros módulos.

```bash
python -m pytest packages/security/tests -q
```

Los relojes y los verificadores externos se sustituyen por dobles de prueba,
por lo que las pruebas no dependen de la hora real, de la red ni de servicios
externos. Cada prueba crea su propio limitador y verifier, sin estado
compartido.
