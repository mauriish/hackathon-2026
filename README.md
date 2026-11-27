# Hackathon 2026

Repositorio colaborativo para el proyecto Hackathon 2026, desarrollado por
cinco integrantes. El stack y la aplicación aún están por definirse.

## Estado del repositorio

Actualmente, el repositorio contiene las instrucciones de colaboración,
configuración de OpenCode, skills de trabajo, una plantilla de variables de
entorno y validaciones estructurales de CI. Aún no hay una aplicación ni
comandos de instalación, compilación o pruebas propios de un stack.

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

Las funcionalidades se desarrollan en ramas `feature/vN/nombre`, creadas
desde su rama `release/vN`, y se integran mediante Pull Requests hacia el
release correspondiente. Las ramas principales y de release requieren
validaciones y revisión humana; no se deben integrar cambios directamente
ni realizar merges autónomos.

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
manualmente. Comprueba archivos requeridos, archivos de entorno versionados y
marcadores de conflictos. Las validaciones de lint, tipos, build y pruebas se
añadirán cuando se defina el stack tecnológico.
