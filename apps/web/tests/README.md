# Pruebas del frontend

Las pruebas end-to-end viven en `e2e/` y usan Playwright.

Comandos desde `apps/web`:

```bash
npx playwright install chromium
npm run test:e2e
```

Cubren navegación entre Check, Report y Protect, ausencia de Watch, teclado,
viewport móvil, validación del mensaje, error controlado con reintento y los
tres escenarios de resultado.
