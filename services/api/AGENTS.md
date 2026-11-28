# Límites de `services/api/`

Responsable: `ivanrome2303` (backend y base de datos).

- Mantén aquí rutas, persistencia, procesamiento de reportes, consultas e
  integración del backend, junto con sus pruebas unitarias y documentación.
- Usa contratos públicos de `contracts/`; no acoples el API a implementaciones
  internas de IA o seguridad.
- No edites otros módulos, contratos ni configuración compartida
  unilateralmente. Solicita cambios transversales mediante Issue o PR con
  revisión de los propietarios afectados y `mauriish`.
- Backend: Python 3.12, FastAPI, Pydantic y OpenAPI; base de datos PostgreSQL
  con Supabase. Consulta `docs/architecture.md` para la decisión completa.
- Conserva contribuciones existentes; no fijes versiones ni inicialices
  aplicaciones fuera de la Issue asignada.
