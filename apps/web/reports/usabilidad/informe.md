# Informe de usabilidad y comprensión de resultados (H26-40)

Estado: **pendiente de sesiones con participantes**. No se han registrado
observaciones humanas; las celdas «Pendiente» se completarán después de cada
sesión siguiendo `guion-prueba.md`. No se incluyen datos personales.

## Participantes

| ID | Sesión | Consentimiento informado | Datos personales registrados |
| --- | --- | --- | --- |
| P01 | Pendiente | Pendiente | Ninguno |
| P02 | Pendiente | Pendiente | Ninguno |
| P03 | Pendiente | Pendiente | Ninguno |
| P04 | Pendiente | Pendiente | Ninguno |
| P05 | Pendiente | Pendiente | Ninguno |

El número de participantes es una propuesta del guion; se ajustará según la
disponibilidad real sin rellenar resultados ficticios.

## Resultados por tarea

| Tarea | Participante | Completada sin ayuda | Tiempo | Ayudas | Observación anonimizada |
| --- | --- | --- | --- | --- | --- |
| T1 | P01 | Pendiente | Pendiente | Pendiente | Pendiente |
| T1 | P02 | Pendiente | Pendiente | Pendiente | Pendiente |
| T1 | P03 | Pendiente | Pendiente | Pendiente | Pendiente |
| T1 | P04 | Pendiente | Pendiente | Pendiente | Pendiente |
| T1 | P05 | Pendiente | Pendiente | Pendiente | Pendiente |
| T2 | P01 | Pendiente | Pendiente | Pendiente | Pendiente |
| T2 | P02 | Pendiente | Pendiente | Pendiente | Pendiente |
| T2 | P03 | Pendiente | Pendiente | Pendiente | Pendiente |
| T2 | P04 | Pendiente | Pendiente | Pendiente | Pendiente |
| T2 | P05 | Pendiente | Pendiente | Pendiente | Pendiente |
| T3 | P01 | Pendiente | Pendiente | Pendiente | Pendiente |
| T3 | P02 | Pendiente | Pendiente | Pendiente | Pendiente |
| T3 | P03 | Pendiente | Pendiente | Pendiente | Pendiente |
| T3 | P04 | Pendiente | Pendiente | Pendiente | Pendiente |
| T3 | P05 | Pendiente | Pendiente | Pendiente | Pendiente |
| T4 | P01 | Pendiente | Pendiente | Pendiente | Pendiente |
| T4 | P02 | Pendiente | Pendiente | Pendiente | Pendiente |
| T4 | P03 | Pendiente | Pendiente | Pendiente | Pendiente |
| T4 | P04 | Pendiente | Pendiente | Pendiente | Pendiente |
| T4 | P05 | Pendiente | Pendiente | Pendiente | Pendiente |
| T5 | P01 | Pendiente | Pendiente | Pendiente | Pendiente |
| T5 | P02 | Pendiente | Pendiente | Pendiente | Pendiente |
| T5 | P03 | Pendiente | Pendiente | Pendiente | Pendiente |
| T5 | P04 | Pendiente | Pendiente | Pendiente | Pendiente |
| T5 | P05 | Pendiente | Pendiente | Pendiente | Pendiente |

## Comprensión del carácter simulado

| Pregunta | Respuesta esperada | Respuesta registrada |
| --- | --- | --- |
| ¿El resultado viene de un análisis real? | No, es una demostración. | Pendiente |
| ¿Qué significa «No disponible» o «No verificada»? | Falta información; no significa que sea seguro. | Pendiente |
| ¿Qué haría antes de abrir un enlace sospechoso? | Verificar por un canal oficial o consultar con alguien de confianza; no compartir datos. | Pendiente |

## Evidencia automatizada de apoyo

Comando ejecutado desde `apps/web`:

```bash
npm.cmd run test:e2e -- tests/e2e/usability-comprehension.spec.ts
```

Resultado verificado el 2026-11-28: 5 pruebas ejecutadas, 5 exitosas en
Chromium. Cubre las pistas observables de T1–T5 (etiquetas de demostración,
ratings, confianza, recomendaciones, distinción de estados, aviso de que no se
solicitan permisos y ausencia de envíos en el asistente de reporte). No acredita
comprensión humana ni sustituye las sesiones guiadas pendientes.

## Hallazgos y acciones correctivas

Pendiente de las sesiones con participantes. No se registran observaciones
inventadas.

## Limitaciones

- El frontend usa resultados de demostración; no hay backend ni proveedor de IA
  integrado en este release.
- La implementación real necesaria para la aceptación (H26-34) está pendiente;
  por ello no se puede evaluar aquí la comprensión de resultados reales.
- No se han realizado todavía sesiones con personas participantes.
