# Presentación y demostración — Prevención Mayor

Guion reproducible de la demostración disponible en esta rama. La integración
real de los módulos depende de H26-06 (#9), todavía abierta; por tanto, este
documento no presenta la demo web como un producto integrado.

## Pitch (30 segundos)

Prevención Mayor busca ayudar a las personas, especialmente a quienes pueden
ser más vulnerables a engaños digitales, a detenerse antes de responder a un
mensaje sospechoso. Check permite revisar un mensaje, Report muestra el flujo
de registro de un incidente y Protect enseña cómo reconocer señales de riesgo y
qué hacer. La interfaz y estos recorridos son demostrativos: los resultados
mostrados no proceden todavía de un análisis real ni se guardan en un backend.

## Guion cronometrado (5 minutos)

| Tiempo | Acción | Mensaje |
| --- | --- | --- |
| 0:00–0:30 | Presentar el problema y el propósito. | «Queremos que consultar una duda sea sencillo, claro y sin juzgar a la persona». |
| 0:30–1:40 | Abrir **Check**, pegar el mensaje ficticio indicado abajo y revisar el resultado. | Explicar que el resultado es fijo/de demostración; no enviar mensajes reales ni datos personales. |
| 1:40–2:30 | Abrir **Report** y mostrar la vista previa. | El registro real y la persistencia requieren la API; el estado de esta pantalla es «Pendiente de envío». |
| 2:30–3:40 | Abrir **Protect**, entrar a la simulación y recorrer alerta y acompañamiento. | El mensaje es ficticio y la alerta está predefinida; señalar las recomendaciones de seguridad. |
| 3:40–4:30 | Resumir los límites y el estado técnico. | En esta rama se ejecuta el frontend; la integración real de API e IA está pendiente de H26-06. |
| 4:30–5:00 | Cierre y preguntas. | No es un detector validado ni sustituye el criterio humano o los canales oficiales. |

### Datos ficticios para el ensayo

Usa únicamente este mensaje inventado:

> Su cuenta será suspendida hoy. Verifique sus datos en
> `https://banco-ejemplo.invalid/confirmar`.

No abras el enlace. La aplicación no envía el texto a un servidor, pero se
recomienda no pegar información personal durante una presentación.

## Preparar y ejecutar

Requisitos: Node.js LTS y npm. En una terminal, desde la raíz del repositorio:

```bash
cd apps/web
npm install
npm run dev
```

Abre `http://localhost:3000`. No se requiere `.env`, cuenta externa, base de
datos ni servicio de IA para este recorrido. El servidor de desarrollo debe
permanecer abierto durante la demostración.

### Recorrido manual

1. En la portada, entra a **Check** y abre la revisión.
2. Pega el mensaje ficticio y pulsa **Revisar mensaje**. El resultado de riesgo
   alto es una respuesta local de demostración, no un análisis del texto.
3. Abre `http://localhost:3000/report?escenario=alto` para mostrar la vista
   previa de Report. También se pueden probar `moderado` y `bajo`.
4. Entra a **Protect** y abre la bandeja simulada. Recorre la alerta y el
   acompañamiento; el contenido es estático.

Para preparar un caso de resultado moderado o bajo de Check, se puede abrir
`/check/revisar?escenario=moderado` o
`/check/revisar?escenario=bajo` antes de enviar el texto. El estado de error se
puede mostrar con `/check/revisar?estado=error`.

### Comprobación opcional

Desde `apps/web`, los comandos definidos por el paquete son:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Para ejecutar Playwright por primera vez, si falta Chromium:

```bash
npx playwright install chromium
```

Los comandos son las comprobaciones disponibles del frontend; no prueban una
integración con API, base de datos ni proveedor de IA.

## Métricas y registro del ensayo

No hay métricas de uso, eficacia de detección ni resultados de un ensayo con
personas documentados en esta rama. No presentar cifras de precisión,
incidentes prevenidos o usuarios beneficiados como resultados medidos.

Para cada ensayo, registrar manualmente:

| Métrica | Cómo registrarla |
| --- | --- |
| Duración | Tiempo real desde la presentación hasta el cierre. |
| Recorrido completado | Sí/no para Check, Report y Protect; anotar bloqueos observados. |
| Comprensión | Anotar preguntas o confusiones sobre el carácter simulado. |
| Accesibilidad observada | Anotar problemas de lectura, contraste, teclado o interacción; no equivale a una auditoría formal. |

Indicar fecha, entorno y persona que ensaya. No recopilar mensajes reales,
datos personales ni información sensible. Estos registros son observaciones
cualitativas del ensayo, no métricas de rendimiento del producto.

## Alcance y límites que deben comunicarse

- **Check:** interfaz y navegación demostrativas; el formulario lleva a
  escenarios locales predefinidos. No hay análisis real de contenido.
- **Report:** solo presenta una vista previa; no hay envío ni persistencia.
- **Protect:** muestra un mensaje ficticio y contenido estático; no monitoriza
  mensajes ni dispositivos.
- **API y datos:** no están conectados en esta rama; no se registra ni consulta
  información de incidentes.
- **IA:** no se invoca un proveedor en esta demo. Los resultados no son una
  evaluación fiable de fraude.
- **Seguridad y consejo:** no abrir enlaces sospechosos. Verificar por canales
  oficiales y pedir ayuda a una persona de confianza; la herramienta no
  sustituye asesoría profesional ni decisiones humanas.

H26-06 (#9) permanece como dependencia para la integración real y la validación
de una release candidata. Actualizar estas afirmaciones solo después de probar
esa integración en el release correspondiente.
