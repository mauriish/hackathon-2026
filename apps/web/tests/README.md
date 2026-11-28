# Pruebas del frontend

Las pruebas end-to-end viven en `e2e/` y usan Playwright.

Comandos desde `apps/web`:

```bash
npx playwright install chromium
npm run test:e2e
```

Cubren navegación entre Check, Report y Protect, ausencia de Watch, teclado,
viewport móvil, validación del mensaje, error controlado con reintento, los
tres escenarios de resultado y el asistente de reportes: validación de pasos,
avisos de privacidad, evidencia y contacto opcionales, navegación hacia atrás y
confirmación de demostración. `report-contract.spec.ts` comprueba sin navegador
la construcción de `ReportSubmission` y sus validadores.
