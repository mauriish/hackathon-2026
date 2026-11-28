# Persistencia

La persistencia usa PostgreSQL, compatible con Supabase. Las migraciones SQL
versionadas están en `migrations/` y se registran en
`api_schema_migrations`. Se aplican en orden una sola vez:

```bash
python -m database.cli migrate
```

Configura `API_DATABASE_URL` como variable de entorno usando una URL de
PostgreSQL. No guardes credenciales en el repositorio. La aplicación no ejecuta
migraciones automáticamente al arrancar.

## Purga automática y datos

`report_records` guarda únicamente destinos y texto saneados, junto con el
estado del reporte. No almacena la solicitud original, el token de Turnstile ni
la IP. El `abuse_id` HMAC y su expiración se guardan por separado en
`report_abuse_identifiers`; la base rechaza vigencias mayores a 14 días. Las
operaciones de persistencia eliminan identificadores expirados sin borrar el
reporte saneado. El texto saneado no tiene una expiración fija: requiere
revisión periódica y debe eliminarse si deja de ser útil o se descubre
información sensible.

`report_status_audit` registra el estado anterior, el nuevo estado y la fecha
del cambio. No copia el contenido del reporte. El historial se elimina al
eliminarse el reporte.

## Catálogo de identidades oficiales

La migración `002_create_official_identities.sql` carga los registros curados
de H26-36 en `official_identities`, junto con su sector, fuente, fecha de
verificación y observaciones. `list_official_identities` devuelve el catálogo;
`get_official_identity` busca un dominio exacto y devuelve `None` si no se
encuentra. La búsqueda no infiere subdominios ni considera que un dominio
registrado garantice que un mensaje o sus enlaces sean seguros. El dominio
primario evita duplicados.

Con `API_DATABASE_URL` configurada, el proceso API inicia una tarea que purga
identificadores expirados al arrancar y cada hora. Si la base no está disponible,
el error queda registrado y se reintenta en un minuto; la tarea no impide que
arranque el servidor. Al detenerse el API, la tarea se cancela correctamente y
se reanuda en el siguiente arranque. Por eso, durante una interrupción del API
pueden permanecer filas expiradas hasta que el proceso vuelva a ejecutarse.

Las operaciones de persistencia también purgan identificadores vencidos, y
`purge_expired_abuse_identifiers` permite ejecutar la limpieza explícitamente.
La purga elimina únicamente el seudónimo y conserva el reporte saneado y su
auditoría.

## Pruebas de integración

Las pruebas de base de datos crean y eliminan un esquema aislado. Configura
`API_TEST_DATABASE_URL` con una base dedicada cuyo nombre termine en `_test`;
la prueba falla cerrada si el nombre no cumple esa condición. Nunca apuntes esta
variable a producción. Desde `services/api/`, ejecuta:

```bash
python -m pytest
```

Sin `API_TEST_DATABASE_URL`, las pruebas PostgreSQL se omiten; las pruebas
unitarias existentes siguen ejecutándose.
