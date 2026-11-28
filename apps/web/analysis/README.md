# Análisis

Área de la experiencia Check. Incluye la introducción, el formulario para
compartir un mensaje y la pantalla de resultado de riesgo.

Las rutas implementadas están en `../app/check/`. Los textos y estados de
demostración del formulario y de la vista previa de Report se definen en
`../lib/analysis.ts`.

La pantalla de resultado (`../app/check/resultado`) usa `CheckResultPanel` y las
respuestas de ejemplo de `../lib/check-result.ts`, derivadas del contrato
`Check`. Muestra los ratings de comunidad, IA e identidad, la confianza, los
indicios, la evidencia con su fuente, el resumen y las recomendaciones. Los
estados no concluyente y en conflicto se distinguen con texto, iconos y
`aria-label`, sin depender solo del color.

El análisis real de IA todavía no está conectado: la integración queda pendiente
de los endpoints de análisis y del motor de ponderación.
