# Límites de `.github/`

Responsable: `mauriish` (infraestructura e integración continua).

- CODEOWNERS, scripts y workflows son configuración compartida crítica.
- No modificar el mecanismo de autorización ni sus checks unilateralmente.
  Todo cambio requiere justificación, revisión humana de los propietarios
  afectados y validación en PR.
- El control debe fallar cerrado. La configuración administrativa de GitHub es
  necesaria para proteger workflows, ramas y checks.
