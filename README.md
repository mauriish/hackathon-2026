# Resumen del repositorio

Monorepositorio de una plataforma colaborativa desarrollada por cinco
integrantes. El stack tecnológico está definido; la inicialización de las
aplicaciones corresponde a las Issues asignadas.

## Estado del repositorio

Actualmente, el repositorio contiene las instrucciones de colaboración,
configuración de OpenCode, skills de trabajo, una plantilla de variables de
entorno y validaciones estructurales de CI. La API mínima de `services/api/`
está inicializada y cuenta con `GET /health`; el entorno de pruebas de
`release/v1` está desplegado en Render. El frontend y el flujo completo de
análisis con IA aún no están integrados en esta release.

Consulta la [guía de despliegue](docs/deployment.md) para la configuración y
las comprobaciones del entorno de pruebas. Los comandos de instalación y
pruebas de la API están en [`services/api/README.md`](services/api/README.md).

## Stack tecnológico

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS y shadcn/ui.
- **Backend:** Python 3.12, FastAPI, Pydantic y OpenAPI.
- **Base de datos:** PostgreSQL y Supabase; pgvector solo si se necesita para
  RAG.
- **IA:** Gemini API, RAG sobre conocimiento previamente validado, respuestas
  estructuradas mediante JSON Schema y heurísticas deterministas.
- **Ciberseguridad:** Cloudflare Turnstile, RapidFuzz, tldextract, dnspython,
  RDAP, Google Safe Browsing sujeto a disponibilidad y hashlib para
  deduplicación.
- **Pruebas y calidad:** Pytest, Playwright, ESLint y GitHub Actions.
- **Despliegue previsto:** Vercel para frontend, Render para backend y Supabase
  para base de datos.

La arquitectura es un monorepositorio con backend modular y frontend
independiente. No se utilizarán microservicios ni gestores de dependencias
independientes para cada módulo del backend. No se fijan versiones de
dependencias en esta definición.

## Monorepositorio y propietarios

Cada integrante trabaja dentro de su área. Las rutas y propietarios están
definidos en `.github/CODEOWNERS`, que solicita revisiones pero no concede ni
restringe permisos de escritura. Los `AGENTS.md` locales delimitan el trabajo.
Estos directorios son límites de responsabilidad, no implican servicios
independientes. El backend permanece modular dentro del monorepositorio; el
frontend es independiente.

| Usuario | Rol y área |
| --- | --- |
| `mauriish` | Project Leader y arquitectura; `contracts/`, `docs/`, `.github/` y configuración compartida |
| `saulfsd98-cloud` | Frontend y UI/UX; `apps/web/` |
| `ivanrome2303` | Backend y base de datos; `services/api/` |
| `Chedooo` | AI Engineer; `services/ai/` |
| `aguillonmarthaguadalupe-lab` | QA y Security; `packages/security/` y `tests/` |

Cada módulo mantiene sus pruebas unitarias y documentación específica;
`tests/` contiene pruebas generales de integración, seguridad y E2E. Los
contratos entre componentes se documentan en
[`contracts/README.md`](contracts/README.md).

Las decisiones y límites de arquitectura están documentados en
[`docs/architecture.md`](docs/architecture.md).

La estructura funcional contempla análisis, búsqueda, reportes, componentes y
pruebas en `apps/web/`; rutas, persistencia, comunidad y pruebas en
`services/api/`; análisis, extracción, conocimiento y pruebas en `services/ai/`;
y los componentes de identidad, reputación, ponderación y antiabuso en
`packages/security/`.

## Organización del trabajo

El flujo de ramas previsto es:

```text
main
└── development
    ├── release/v1
    │   └── feature/v1/nombre
    └── release/v2
        └── feature/v2/nombre
```

`main` contiene la versión estable; `development` integra versiones
seleccionadas; `release/vN` corresponde a una versión, y
`feature/vN/nombre` a una funcionalidad. Las features nacen de su release y se
integran mediante PR a ese release. Después, releases seleccionados se proponen
a `development` y los cambios validados se proponen desde `development` a
`main`. No crear ramas sin autorización. Todas las integraciones protegidas
requieren PR y revisión humana; los agentes no realizan merges.

Para solicitar un cambio en un módulo ajeno, abrir una Issue o proponer un PR
con la justificación y solicitar revisión del propietario y de `mauriish`.
No editar unilateralmente contratos, configuración compartida, workflows ni
archivos de otros módulos. Las pruebas unitarias y documentación propia quedan
a cargo del módulo responsable. Usar GitHub Issues para definir tareas y
GitHub Projects para su seguimiento.

`Ownership Authorization` valida PR de features y procedencia de promociones.
Se basa en la identidad del autor del PR, no verifica la identidad de cada autor
de commit. El validador se ejecuta desde la rama base para evitar confiar en su
copia propuesta por el PR. Si el workflow ya está en la base y aún falta el
script, falla cerrado. GitHub no ejecuta un workflow de PR que todavía no existe
en la base: la primera integración del workflow/script requiere revisión humana,
ejecución independiente de sus pruebas y coordinación administrativa; no se
ejecuta código de autorización no confiable del PR.

**Protecciones administrativas:** la consulta a la API de GitHub del
27-11-2026 muestra activo el Ruleset `Protected Branches` para `main`,
`development` y `release/**`. Exige Pull Request y una aprobación, descarta
aprobaciones obsoletas tras nuevos pushes, exige aprobación del último push y
resolución de conversaciones; también bloquea la eliminación y los force-push.
La configuración consultada no exige aprobación de Code Owner ni checks
obligatorios, por lo que `Repository Checks` y `ownership-authorization` no
están garantizados como condiciones de integración por ese Ruleset. CODEOWNERS
asigna revisores, pero no concede ni restringe permisos de escritura. Los
Rulesets, permisos de escritura y otras protecciones dependen de la
configuración administrativa de GitHub y deben volver a verificarse allí si
cambian.

Usar Conventional Commits con descripciones en español, por ejemplo:

```text
feat(auth): implementar inicio de sesión
fix(api): corregir validación de solicitudes
test(auth): agregar pruebas de autenticación
docs(readme): actualizar instrucciones de instalación
```

## Configuración local

1. Clona el repositorio.
2. Copia `.env.example` a `.env` cuando la aplicación necesite configuración.
3. Completa únicamente las variables requeridas para el entorno local.

La plantilla `.env.example` no contiene variables específicas aún. No guardes
credenciales reales en el repositorio; `.env` y otros archivos de entorno
locales están excluidos mediante `.gitignore`.

## OpenCode

La configuración del proyecto está en `opencode.json`. Aplica permisos
conservadores, protege archivos sensibles y pide autorización para operaciones
de mayor impacto. Las instrucciones de colaboración están en `AGENTS.md`.

Las skills disponibles en `.opencode/skills/` cubren:

- `development`: implementación y refactorización.
- `git-workflow`: ramas, commits y Pull Requests.
- `testing`: creación y ejecución de pruebas.
- `code-review`: revisión de cambios y riesgos.
- `documentation`: mantenimiento de documentación.

## Integración continua

El workflow `.github/workflows/checks.yml` se ejecuta en Pull Requests y pushes
a `main`, `development` y ramas `release/**`, y también puede iniciarse
manualmente. Comprueba archivos requeridos, archivos de entorno versionados,
marcadores de conflictos y autorización de rutas. Todavía no ejecuta lint,
verificación de tipos, build ni pruebas de la API; esas validaciones se
incorporarán mediante las Issues correspondientes cuando se acuerden sus
comandos.

`.github/workflows/ownership.yml` valida PR hacia `main`, `development` y
`release/**`. `Repository Checks` y `ownership-authorization` son checks
distintos y deben coexistir.
