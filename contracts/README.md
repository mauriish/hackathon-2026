# Contratos entre módulos

Los contratos compartidos son propiedad de `mauriish`. Los cambios de interfaz
se proponen mediante PR por el propietario del módulo consumidor o productor,
y requieren revisión de `mauriish` y de los propietarios afectados.

## Reglas de comunicación

- Las interfaces HTTP entre consumidores y backend utilizan REST con JSON.
  OpenAPI documenta las API y Pydantic valida los modelos del backend.
- Los módulos acuerdan y documentan aquí sus interfaces antes de integrarlas;
  estos estándares no autorizan acoplamiento a implementaciones internas ni
  fijan por sí solos los esquemas concretos de cada operación.
- `services/api/` y `services/ai/` intercambian capacidades mediante interfaces
  explícitas, sin acoplarse a implementaciones internas.
- `packages/security/` publica capacidades reutilizables; los módulos consumen
  sus interfaces sin editar sus archivos internos.
- **Pruebas:** `tests/` verifica comportamiento usando los contratos públicos,
  no detalles internos de cada módulo.

## Catálogo de contratos

Definir los esquemas concretos con productores y consumidores para:

- Análisis de mensajes y sus ratings comunitario, de IA e identidad digital.
- Ponderación dinámica y búsqueda de organizaciones/dominios similares.
- Extracción estructurada de reportes, validación y almacenamiento.
- Recuperación de conocimiento validado.

Cada propuesta deberá acordar propósito, entradas, salidas, errores,
compatibilidad y ejemplos anonimizados con los propietarios afectados. No
incorporar decisiones de implementación hasta su acuerdo.

## Contratos v1

Los esquemas acordados para reportes, análisis, evidencia, valoraciones y
errores están en [`schemas/v1/contracts.schema.json`](schemas/v1/contracts.schema.json).
El documento OpenAPI de referencia está en [`openapi/v1.json`](openapi/v1.json).
Las rutas de reporte se incorporarán al documento cuando se implementen; por
ahora, OpenAPI describe el endpoint existente `GET /health` y publica los
modelos reutilizables.

### Flujos y privacidad

| Flujo | Contrato y regla |
| --- | --- |
| Frontend → API | `ReportSubmission`; incluye token Turnstile, que solo se verifica en el backend. |
| API → Turnstile | Rechazar el envío si falla la verificación o Turnstile no está disponible; nunca omitir la comprobación. |
| API → almacenamiento Supabase/PostgreSQL | Guardar `ReportRecord` ya saneado. La IA no recibe credenciales ni consulta directamente la base de datos. |
| API → Gemini | Enviar únicamente el mensaje y el contexto general saneados mediante `AnalysisRequest`; la respuesta estructurada usa `AiAssessment`. |
| API → Safe Browsing, RDAP y DNS | Enviar el destino normalizado, sin credenciales, parámetros ni fragmentos. La falta de disponibilidad se representa como señal no disponible, nunca como seguridad. |
| API → frontend | `Check`, con riesgo, confianza, explicación, indicadores, evidencia, recomendaciones y disponibilidad de señales; no expone identificadores antiabuso. |

Los estados de `ReportRecord` describen el ciclo de vida: `received`,
`processing`, `completed`, `rejected` y `failed`. El estado `rejected` cubre
envíos que no superen Turnstile. `Check` puede ser `completed`, `inconclusive`
o `failed`; la falta de respuesta de Gemini produce `no_concluyente` y el
reporte saneado se conserva para reintento. Las fallas de Safe Browsing, RDAP o
DNS solo marcan esa fuente como no disponible y no implican que el destino sea
seguro.

### Catálogo de dominios oficiales (propuesta H26-29)

`OfficialDomainCatalog` publica una lista sin duplicados de hosts ASCII
normalizados en minúsculas, sin esquema, puerto ni punto final. La interfaz
consumidora puede pasar `domains` como colección al clasificador de identidad,
que compara hosts exactos; los subdominios solo coinciden si están incluidos
explícitamente. Un host ausente o desconocido no constituye por sí solo
evidencia de fraude. El ejemplo válido contiene datos mínimos curados del
catálogo H26-10; no define persistencia ni un endpoint HTTP.

`ReportSubmission` es una entrada transitoria y puede contener datos sensibles.
El backend debe redactar nombres, teléfonos, correos, nombres de usuario,
direcciones, datos financieros, credenciales y tokens antes de persistir el
reporte o enviar texto a Gemini. Los mensajes saneados se conservan sin una
fecha de expiración fija mientras sigan siendo útiles, con revisión periódica y
eliminación si dejan de ser útiles o se descubre información sensible.

`ReportRecord.abuse_id` es un seudónimo HMAC de la IP para detección de abuso,
estable por un máximo de 14 días. No se almacena la IP original ni se comparte
el seudónimo con Gemini o el frontend. La retención del reporte no extiende la
vigencia de este identificador.

### Valoración dinámica

Las señales comunitaria, de IA e identidad digital usan puntajes de `0` a `100`
(mayor puntaje equivale a mayor riesgo). Los pesos pueden variar; los pesos de
las señales disponibles deben sumar `1`. Una señal no disponible tiene puntaje
nulo y peso cero; sus pesos se redistribuyen entre las disponibles. Si no hay
señales utilizables, el resultado es `no_concluyente` y el puntaje final es
nulo.

Los niveles se derivan del puntaje final:

| Puntaje | Nivel |
| --- | --- |
| `0 <= score < 20` | `sin_senales_importantes` |
| `20 <= score < 60` | `riesgo_moderado` |
| `60 <= score <= 100` | `riesgo_alto` |

La salida de IA y las recomendaciones se expresan en español. Campos
desconocidos se rechazan. Los cambios incompatibles requieren una nueva versión
de API; los compatibles se mantienen en `/v1`.

### Ejemplos y pruebas

Los casos positivos y negativos se encuentran en `examples/v1/`; Pytest los
valida contra JSON Schema Draft 2020-12. En un entorno con Python y las
dependencias de prueba instaladas:

```bash
python -m pip install -r contracts/requirements-test.txt
python -m pytest contracts/tests -q
```
