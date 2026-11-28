# Servicio API

Propietario: @ivanrome2303 (backend y base de datos). Aquí se organizarán rutas,
persistencia, procesamiento de reportes, inteligencia colectiva, consultas a
incidentes anteriores e integración de componentes.

Mantén las pruebas unitarias y documentación específica aquí. Los cambios de
interfaces se proponen en `contracts/` mediante PR con revisión de los
propietarios afectados. No edites directamente otros módulos ni configuración
compartida; solicita autorización.

El backend utiliza Python 3.12, FastAPI, Pydantic y OpenAPI, con PostgreSQL y
Supabase para datos. Consulta [`docs/architecture.md`](../../docs/architecture.md)
para las decisiones completas; la configuración e inicialización se realizan
en las Issues correspondientes.

## Persistencia

La persistencia PostgreSQL utiliza `API_DATABASE_URL`; las migraciones se
aplican explícitamente desde `services/api/` con
`python -m database.cli migrate`. Consulta
[`database/README.md`](database/README.md) para configuración y pruebas aisladas.
