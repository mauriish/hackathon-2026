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
| `/check/resultado` | Resultado de riesgo alto, moderado o bajo. |
| `/report` | Vista previa con tipo de escenario y resultado de evaluación. |
| `/report/formulario` | Asistente de reporte en tres pasos y confirmación. |
| `/protect` | Introducción del simulador. |
| `/protect/simulacion` | Bandeja simulada con mensaje ficticio. |
| `/protect/alerta` | Alerta de riesgo alto y acciones recomendadas. |
| `/protect/acompanamiento` | Orientación y siguientes pasos. |

No existe la sección Watch.

## Resultados y modo demo

El análisis real de IA todavía no está integrado. La interfaz trabaja con tres
resultados de demostración:

- `?escenario=alto`
- `?escenario=moderado`
- `?escenario=bajo`

Este parámetro existe solo para probar los estados. Las pantallas están marcadas
como **Demo** y no presentan los resultados simulados como un análisis real.

En `/check/revisar`, `?estado=error` muestra el estado de error.

## Formulario de reporte

El asistente de `/report/formulario` tiene tres pasos: relato, evidencia
opcional y datos de contacto opcionales. El dictado usa la Web Speech API del
navegador; si no está disponible, muestra un mensaje y el relato se puede
escribir. La confirmación indica explícitamente que es una demostración y que
no se enviaron datos a ningún servidor.

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
- `components/`: componentes compartidos del sitio, incluido `report-form.tsx`.
- `lib/`: tipos y datos de demostración de análisis.
- `public/`: logo y recursos estáticos.
- `tests/e2e/`: pruebas de navegación, teclado y viewport.

## Limitaciones

- No hay backend, persistencia ni proveedor de IA real.
- Report muestra una vista previa y el formulario no registra ni envía incidentes.
- Protect usa un mensaje ficticio fijo con fines educativos.

Consulta `AGENTS.md` antes de modificar este módulo o cualquier contrato compartido.
