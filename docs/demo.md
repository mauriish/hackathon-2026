# Presentación y demostración — Prevención Mayor

Guion para la rama `release/v1`. En esta versión solo está disponible la API
mínima de pruebas; no hay una interfaz web integrada ni análisis real de IA.
H26-06 (#9), que coordina la integración real, sigue pendiente. Por tanto, la
presentación cubre Check, Report y Protect como propuesta de producto y declara
explícitamente que sus recorridos son simulados, no una demo funcional integrada.

## Pitch (30 segundos)

Prevención Mayor busca ayudar a las personas, especialmente a quienes pueden
ser más vulnerables a engaños digitales, a detenerse antes de responder a un
mensaje sospechoso. La propuesta reúne tres recorridos: Check para consultar
un mensaje dudoso, Report para compartir un incidente y Protect para aprender a
reconocer señales de riesgo y actuar con cautela. En `release/v1` estos
recorridos todavía no están conectados como producto; la API desplegada solo
permite comprobar disponibilidad.

## Guion cronometrado (5 minutos)

| Tiempo | Acción | Mensaje |
| --- | --- | --- |
| 0:00–0:30 | Presentar el problema y el propósito. | «Queremos que consultar una duda sea sencillo, claro y sin juzgar a la persona». |
| 0:30–1:20 | Explicar Check con un ejemplo ficticio de mensaje urgente. | El análisis de contenido no está implementado en esta release; no se genera una clasificación real. |
| 1:20–2:10 | Explicar Report y qué información se compartiría. | El flujo de reporte y su persistencia no están disponibles en esta release. |
| 2:10–3:00 | Explicar Protect y las acciones preventivas que propone. | No monitoriza mensajes ni dispositivos; no hay una interfaz interactiva integrada. |
| 3:00–4:00 | Comprobar en vivo el endpoint de salud de la API. | Esto demuestra que responde el servicio mínimo, no que Check, Report o Protect estén integrados. |
| 4:00–4:40 | Resumir estado, simulaciones y límites. | La integración real depende de H26-06 (#9), que sigue pendiente. |
| 4:40–5:00 | Cierre y preguntas. | No es un detector validado ni sustituye el criterio humano o los canales oficiales. |

### Ejemplo ficticio

> Su cuenta será suspendida hoy. Verifique sus datos en
> `https://banco-ejemplo.invalid/confirmar`.

Es un ejemplo inventado para explicar el caso de uso; no lo envíes al endpoint
de salud ni abras el enlace. No uses mensajes reales ni datos personales durante
la presentación.

## Preparación y comprobación reproducible

La comprobación disponible en `release/v1` es la API de pruebas publicada en
Render. Es un servicio público, no productivo; no envíes datos confidenciales.
La configuración completa y sus limitaciones están en
[`deployment.md`](deployment.md).

En PowerShell:

```powershell
Invoke-RestMethod https://hackathon-api-pruebas.onrender.com/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

También se puede ejecutar localmente desde `services/api/` con Python 3.12:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

En otra terminal:

```bash
curl -fsS http://127.0.0.1:8000/health
```

La API publica únicamente `GET /health`; la comprobación no procesa mensajes,
crea reportes ni realiza acciones de Protect. Los comandos locales y las pruebas
del API están documentados en [`services/api/README.md`](../services/api/README.md).

## Métricas del ensayo

No hay resultados de ensayos con personas ni métricas de eficacia documentados
para esta release. No presentar cifras de precisión, incidentes prevenidos o
usuarios beneficiados como resultados medidos.

Registrar manualmente cada ensayo, indicando fecha, entorno y responsable:

| Métrica | Cómo registrarla |
| --- | --- |
| Duración | Tiempo real desde la presentación hasta el cierre. |
| Secciones cubiertas | Sí/no para Check, Report, Protect y la comprobación de `/health`. |
| Comprensión | Preguntas o confusiones sobre qué está implementado y qué se simula. |
| Bloqueos observados | Problemas de conexión o instrucciones que impidieron completar el guion. |

Estos datos describen el ensayo, no el rendimiento ni la eficacia del producto.
No recopiles mensajes reales, datos personales ni información sensible.

## Límites que deben comunicarse

- **Check:** no hay interfaz ni análisis real del mensaje en `release/v1`.
- **Report:** no hay flujo de envío ni persistencia disponible en esta release.
- **Protect:** no monitoriza mensajes o dispositivos y no cuenta con recorrido
  interactivo integrado.
- **API:** el despliegue de pruebas expone únicamente `GET /health`; responde
  disponibilidad y no representa la integración de los módulos.
- **IA y detección:** no se invoca un proveedor ni se calcula una evaluación
  fiable de fraude.
- **Datos y seguridad:** no introduzcas datos sensibles en la URL pública.
  Verifica mensajes sospechosos por canales oficiales y pide ayuda a alguien de
  confianza.

H26-06 (#9) permanece como dependencia para la integración y validación de la
release candidata. Actualizar este guion solo después de verificar el
comportamiento real en `release/v1`.
