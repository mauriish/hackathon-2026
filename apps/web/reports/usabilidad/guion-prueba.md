# Guion de prueba de usabilidad y comprensión (H26-40)

Estado: guion listo para ejecutar; las sesiones con participantes están pendientes.

## Objetivo

Comprobar que una persona mayor entiende los ratings, las recomendaciones y el
carácter simulado de Check y Protect, y que puede reportar un caso sin entregar
datos personales.

## Alcance

- Pantallas: `/check/resultado`, `/protect/simulacion` y `/report/nuevo`.
- Datos: solo escenarios sintéticos (`alto`, `moderado`, `bajo`,
  `no_concluyente`, `conflicto`).
- Contratos: se usa la forma del contrato `Check` acordada en H26-27. La
  integración real de H26-34 está pendiente en este release, por lo que ningún
  resultado presentado es un análisis real.

## Preparación

1. Desde `apps/web`, instalar dependencias con `npm install` y ejecutar
   `npm run dev`.
2. Verificar que los escenarios de demostración cargan con sus parámetros.
3. Reclutar participación voluntaria de personas mayores. Asignar identificadores
   anónimos `P01`, `P02`, … sin nombres, correos ni teléfonos.
4. Explicar que la sesión es una demostración, que pueden interrumpirla en
   cualquier momento y que no se evaluará a la persona.
5. Grabar solo con autorización explícita y sin capturar datos personales.

## Tareas guiadas

Para cada tarea, leer la consigna en voz alta, dejar que la persona actúe y
anotar resultado, tiempo aproximado, ayudas necesarias y una observación
anonimizada. No dar pistas antes de registrar la primera respuesta.

| ID | Consigna para la persona | Éxito esperado |
| --- | --- | --- |
| T1 | «Abre el resultado de un mensaje con riesgo alto y dime si crees que es un análisis real.» | Llega a `/check/resultado?escenario=alto`, identifica la etiqueta **Demo** y responde que es una demostración. |
| T2 | «Explica qué significan las tres señales, la confianza y las recomendaciones.» | Encuentra Comunidad, IA e Identidad, lee la confianza y menciona al menos una recomendación segura. |
| T3 | «Compara el resultado sin conclusión con el de señales en conflicto y dime si alguno significa que el mensaje es seguro.» | Distingue ambos estados y responde que ninguno garantiza seguridad. |
| T4 | «En Protect, decide qué hacer con el mensaje recibido y explica de dónde viene.» | Identifica **Simulación** y **Demo**, ve el mensaje ficticio y elige una acción de verificación sin abrir enlaces reales. |
| T5 | «Reporta el caso sin dejar datos de contacto y comprueba qué ocurre con el envío.» | Completa el asistente sin contacto, confirma los datos extraídos, pulsa «Soy una persona» y entiende que no se envía nada. |

## Preguntas de comprensión

Registrar la respuesta literal solo si no contiene datos personales; si los
contiene, descartarla y anotar «respuesta con dato personal no registrada».

1. ¿Este resultado viene de un análisis real? (esperado: no, es demostración).
2. ¿Qué significa que una señal esté «No disponible» o «No verificada»?
   (esperado: falta información; no implica que el mensaje sea seguro).
3. ¿Qué harías antes de pulsar un enlace sospechoso? (esperado: verificar por un
   canal oficial o consultar con alguien de confianza; no compartir datos).

## Criterios propuestos para el informe

- T1 y T4: toda persona participante reconoce la etiqueta de demostración.
- T2 y T3: al menos cuatro de cinco personas interpretan correctamente las
  señales y la diferencia entre no concluyente y conflicto.
- T5: ninguna sesión intenta introducir datos personales de contacto ni
  interpreta el envío como real.

Estos umbrales son propuestos por el guion y deben confirmarse en la revisión.

## Registro sin datos personales

- Usar únicamente `P01`, `P02`, … como identificadores.
- No transcribir nombres, correos, teléfonos ni mensajes reales aportados por
  las personas participantes.
- No guardar capturas donde aparezcan datos personales.
- Completar el registro en `informe.md` con observaciones anonimizadas.

## Apoyo automatizado

Las tareas T1–T5 tienen una comprobación automática de apoyo en
`tests/e2e/usability-comprehension.spec.ts`:

```bash
npm.cmd run test:e2e -- tests/e2e/usability-comprehension.spec.ts
```

Esta automatización verifica pistas observables en pantalla, pero no sustituye
la observación guiada ni permite afirmar que una persona comprendió el mensaje.
