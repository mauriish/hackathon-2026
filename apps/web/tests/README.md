# Pruebas del frontend

Las pruebas end-to-end viven en `e2e/` y usan Playwright.

Comandos desde `apps/web`:

```bash
npx playwright install chromium
npm run test:e2e
```

Cubren navegación entre Check, Report y Protect, ausencia de Watch, teclado,
viewport móvil, validación del mensaje, error controlado con reintento, los
tres escenarios de resultado, los tres ratings con su etiqueta accesible, la
confianza, la evidencia y la distinción entre no concluyente y conflicto.
`protect-simulator.spec.ts` cubre los cuatro escenarios sintéticos, la etiqueta
de simulación, la ausencia de permisos y SMS reales, el estado de carga, el
error con reintento y el paso del escenario por alerta, acompañamiento, Check y
Report. También cubren el asistente de reportes: validación de pasos, avisos de
privacidad, evidencia y contacto opcionales, navegación hacia atrás y
confirmación de demostración, los datos extraídos editables, la cancelación de
cambios, la confirmación obligatoria y el CAPTCHA simulado.
`report-contract.spec.ts` comprueba sin navegador la extracción simulada, la
construcción de `ReportSubmission` y sus validadores; `captcha.spec.ts` cubre
los estados pendiente, verificado, error y reintento sin temporizadores.
`usability-comprehension.spec.ts` verifica las cinco tareas de apoyo de H26-40:
reconocimiento de la demostración, comprensión de ratings y recomendaciones,
distinción entre no concluyente y conflicto, carácter simulado de Protect y
reporte sintético sin envíos de datos. El guion y el informe de observación
guiada están en `../reports/usabilidad/`.
