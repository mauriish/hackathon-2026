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
para las decisiones completas.

## Inicio local

Desde `services/api/`, instala las dependencias y ejecuta el servidor:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API expone `GET /health`, que responde `{"status":"ok"}`. La configuración
opcional se realiza mediante `APP_NAME`, `APP_ENV`, `APP_HOST` y `APP_PORT`;
los valores inválidos impiden el arranque. No se requieren secretos para esta
inicialización.

Ejecuta las pruebas desde `services/api/`:

```bash
python -m pytest
```
