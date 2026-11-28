# Despliegue del entorno de pruebas

## API de pruebas v1

El entorno actual publica únicamente la API mínima de `release/v1` en Render.
Es un servicio de pruebas, no producción. Su URL es pública y no debe utilizarse
para datos confidenciales:

<https://hackathon-api-pruebas.onrender.com>

La configuración verificada del servicio es:

| Campo | Valor |
| --- | --- |
| Repositorio | `mauriish/hackathon-2026` |
| Rama | `release/v1` |
| Directorio raíz | `services/api` |
| Runtime | Python `3.12.10` |
| Plan | Free |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/health` |
| Auto-deploy | `On Commit` |

Render recibe los cambios de la rama configurada y vuelve a desplegar el
servicio. `release/v1` debe actualizarse mediante el flujo de PR aprobado del
repositorio; no se deben hacer pushes directos a esa rama.

## Variables de entorno

| Variable | Valor actual u origen | Propósito |
| --- | --- | --- |
| `PYTHON_VERSION` | `3.12.10` en Render | Selecciona el runtime Python del servicio. |
| `PORT` | Proporcionada por Render | Puerto usado por el comando de Uvicorn; no añadirla manualmente. |
| `APP_NAME` | No configurada; default `Hackathon API` | Nombre de la aplicación. |
| `APP_ENV` | No configurada; default `development` | Entorno de la aplicación. |
| `APP_HOST` | No configurada; default `127.0.0.1` | Configuración de la aplicación; no controla el listener de Uvicorn en Render. |
| `APP_PORT` | No configurada; default `8000` | Configuración de la aplicación; el listener de Uvicorn usa `PORT`. |

No se configuraron credenciales ni variables de Supabase, Gemini, Turnstile u
otros servicios externos. La API desplegada no usa esos servicios.

No copiar secretos a este documento, al repositorio ni a los logs. Si en el
futuro una integración requiere credenciales, deben añadirse únicamente en la
configuración segura del proveedor y documentarse aquí solo por nombre y
propósito.

## Comprobación básica

El endpoint actual de disponibilidad es `GET /health`. Debe responder HTTP 200
con:

```json
{"status":"ok"}
```

Con `curl`:

```bash
curl -fsS https://hackathon-api-pruebas.onrender.com/health
```

En PowerShell:

```powershell
Invoke-RestMethod https://hackathon-api-pruebas.onrender.com/health
```

La especificación `GET /openapi.json` permite confirmar los endpoints
publicados. En este despliegue solo se anuncia `GET /health`. La ruta raíz `/`
no está implementada y responde 404; eso es esperado y no indica que el
servicio esté caído.

## Alcance y limitaciones

- La verificación realizada confirmó el build con Python 3.12.10, el servicio
  activo y respuestas HTTP 200 de `/health`.
- Este entorno no incluye frontend, conexión a Supabase ni motor de IA. No
  permite probar el análisis real de mensajes ni otros endpoints todavía no
  implementados.
- Render Free puede suspender el servicio cuando está inactivo; la primera
  solicitud posterior puede tardar en despertar. El sistema de archivos local
  no es persistente.
- El servicio tiene URL pública, aunque sea solo para pruebas. No enviar datos
  personales, credenciales ni contenido confidencial.
- Mantener el servicio en el plan Free. No habilitar servicios, planes o uso que
  pueda generar cargos sin aprobación expresa. Revisar las cuotas y límites
  vigentes en Render; exceder ciertos límites puede suspender builds o servicios
  y el tratamiento de uso adicional depende de la configuración de facturación
  del workspace.
- Este servicio pertenece a `release/v1`. El entorno unificado con frontend y
  backend se planificará por separado después de integrar releases compatibles
  en `development`.

Consultar las [limitaciones actuales de Render Free](https://render.com/docs/free)
antes de cambiar el plan o la configuración de facturación.
