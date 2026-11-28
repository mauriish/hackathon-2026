# Aplicación web — Prevención Mayor

Frontend independiente de Prevención Mayor. Implementa los flujos de Check,
Report y Protect con una interfaz Healthcare UI: calma, claridad, tarjetas
blancas, texto legible y foco visible.

Propietario: @saulfsd98-cloud (frontend y UI/UX).

## Stack

- Next.js con App Router.
- React y TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Playwright para pruebas end-to-end.

## Requisitos previos

- Node.js LTS.
- npm.

No se fijan versiones manualmente en este documento; las versiones efectivas
están en `package.json` y `package-lock.json`.

## Instalación

Desde `apps/web`:

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Comandos de validación

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Para instalar el navegador de Playwright, si aún no está disponible:

```bash
npx playwright install chromium
```

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Logo y botón **Entrar a Check**. |
| `/check` | Introducción de Check. |
| `/check/revisar` | Formulario para compartir un mensaje, correo o enlace. |
| `/check/resultado` | Resultado con tres ratings, confianza, indicios, evidencia, resumen y recomendaciones. |
| `/report` | Vista previa con tipo de escenario y resultado de evaluación. |
| `/report/nuevo` | Asistente de tres pasos: relato, destino y evidencia opcional, y contacto opcional. |
| `/protect` | Introducción del simulador. |
| `/protect/simulacion` | Bandeja simulada con mensaje ficticio. |
| `/protect/alerta` | Alerta de riesgo alto y acciones recomendadas. |
| `/protect/acompanamiento` | Orientación y siguientes pasos. |

No existe la sección Watch.

## Resultados y modo demo

El análisis real de IA todavía no está integrado. La interfaz trabaja con cinco
resultados de demostración:

- `?escenario=alto`
- `?escenario=moderado`
- `?escenario=bajo`
- `?escenario=no_concluyente`
- `?escenario=conflicto`

Los datos de `/check/resultado` siguen la forma del contrato `Check` de
`contracts/` y se definen en `lib/check-result.ts`. Cada rating muestra su
etiqueta, puntuación y peso, además del color; una señal no disponible se
identifica como **No disponible** o **No verificada**, y las señales divergentes
se presentan como **Señales en conflicto** sin afirmar que sea un fraude.

Este parámetro existe solo para probar los estados. Las pantallas están marcadas
como **Demo** y no presentan los resultados simulados como un análisis real.

En `/check/revisar`, `?estado=error` muestra el estado de error.

## Sistema visual

| Uso | Color |
| --- | --- |
| Color principal, barra superior y botones | `#174A45` |
| Verde suave y bordes | `#DCECE5` |
| Fondo | `#F7F4EA` |
| Advertencia | `#E69A42` |
| Seguro | `#287A50` |
| Riesgo alto | `#B95A35` |
| Información | `#536A78` |
| Texto | `#303B37` |
| Tarjetas | `#FFFFFF` |

Los colores están definidos como tokens en `app/globals.css`.

## Estructura

- `app/`: rutas de la aplicación.
- `components/ui/`: componentes generados por shadcn/ui.
- `components/`: componentes compartidos del sitio.
- `lib/`: tipos y datos de demostración de análisis y reportes.
- `public/`: logo y recursos estáticos.
- `tests/e2e/`: pruebas de navegación, teclado, viewport, asistente de
  reportes y construcción del contrato.

## Limitaciones

- No hay backend, persistencia ni proveedor de IA real.
- Report muestra una vista previa y un asistente en modo demostración; no
  registra incidentes ni envía datos.
- Protect usa un mensaje ficticio fijo con fines educativos.

Consulta `AGENTS.md` antes de modificar este módulo o cualquier contrato compartido.
