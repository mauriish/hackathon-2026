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

## Datos y privacidad

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

El purgado ocurre al crear, consultar o actualizar registros y también está
disponible mediante `purge_expired_abuse_identifiers`. No se configura un
proceso periódico en esta Issue; en periodos sin actividad podrían permanecer
identificadores expirados hasta la siguiente operación o purga explícita.

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
