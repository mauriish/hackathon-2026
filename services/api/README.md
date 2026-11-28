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
general se realiza mediante `APP_NAME`, `APP_ENV`, `APP_HOST` y `APP_PORT`.

## Recepción de reportes

`POST /reports` acepta el contrato `ReportSubmission`, verifica Turnstile,
aplica rate limiting y deduplicación, redacta patrones conocidos de datos
sensibles y guarda el registro con estado `received`. Devuelve `202 Accepted`
sin incluir el registro ni su identificador antiabuso; ese estado no publica ni
valida el reporte. Las solicitudes duplicadas reciben el mismo acuse y no se
guardan nuevamente.

Para habilitar la recepción configura `API_DATABASE_URL`,
`API_ABUSE_HMAC_SECRET` y `TURNSTILE_SECRET_KEY` en el entorno del servidor.
`API_ABUSE_HMAC_SECRET` debe ser un secreto aleatorio de al menos 32 caracteres.
La ausencia de cualquiera de ellos mantiene el endpoint cerrado. No guardes
estos secretos en el repositorio. Turnstile se verifica contra Cloudflare con
un tiempo límite; las fallas del proveedor se rechazan.

La IP de conexión solo se utiliza en memoria para calcular un HMAC de 14 días;
no se almacena ni se envía a Turnstile. Las huellas de deduplicación y el límite
de frecuencia son en memoria y se reinician al reiniciar el proceso.

La redacción es determinista y cubre patrones como correos, teléfonos,
direcciones y credenciales etiquetadas; no puede identificar con certeza todos
los nombres o datos sensibles en texto libre. Revisa el alcance de
`reports/sanitization.py` antes de exponer el endpoint a tráfico no confiable.

## Persistencia

La persistencia PostgreSQL utiliza `API_DATABASE_URL`; las migraciones se
aplican explícitamente desde `services/api/` con
`python -m database.cli migrate`. Consulta
[`database/README.md`](database/README.md) para configuración y pruebas aisladas.

Ejecuta las pruebas desde `services/api/`:

```bash
python -m pytest
```
