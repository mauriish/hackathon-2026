
# AGENTS.md — Hackathon 2026

## 1. Contexto y principios

Proyecto colaborativo de cinco integrantes, desarrollado mediante
OpenCode con libertad de elección del modelo de IA.

Priorizar:

- Simplicidad, funcionalidad, estabilidad y mantenibilidad.
- Desarrollo paralelo sin interferir con otros integrantes.
- Cambios pequeños, coherentes y limitados a la tarea asignada.
- Reutilización de código y respeto a la arquitectura existente.
- Validación automatizada y supervisión humana.
- Evitar sobreingeniería, dependencias innecesarias y burocracia.

Identificar el stack tecnológico mediante los archivos del repositorio.
No inventar requisitos, tecnologías, configuraciones ni comandos.
Consultar al usuario ante decisiones importantes o ambiguas.

## 2. Arquitectura de ramas

    main
    └── development
        ├── release/v1
        │   └── feature/v1/nombre
        └── release/v2
            └── feature/v2/nombre

- `main`: versión estable del producto.
- `development`: integración general de cambios compatibles.
- `release/vN`: versión independiente del producto.
- `feature/vN/nombre`: desarrollo aislado de una funcionalidad.

Crear cada feature desde su release correspondiente.
Cuando exista una Issue, preferir `feature/vN/numero-descripcion`.

Flujo de integración:

    feature/vN/nombre -> release/vN -> development -> main

Solo promover versiones seleccionadas y compatibles.
No fusionar versiones independientes incompatibles.

Las ramas main, development y release deben protegerse mediante
Pull Requests, validaciones satisfactorias y aprobación humana.

## 3. Workflow obligatorio

Para cada tarea:

1. Comprender los requisitos y consultar la Issue asociada.
2. Cargar las Skills necesarias.
3. Inspeccionar el repositorio, rama activa y cambios existentes.
4. Verificar el release correspondiente y trabajar en su feature.
5. Analizar el código y planificar los cambios mínimos necesarios.
6. Implementar la funcionalidad o corrección.
7. Crear o actualizar las pruebas pertinentes.
8. Ejecutar las validaciones locales disponibles.
9. Revisar las diferencias y facilitar su inspección en VS Code.
10. Revisar README.md y actualizarlo cuando corresponda.
11. Generar Conventional Commits.
12. Realizar push exclusivamente a la feature asignada.
13. Crear un Pull Request hacia el release correspondiente.
14. Esperar GitHub Actions y la revisión de otro integrante.

Si existen errores o validaciones pendientes, comunicarlos
y utilizar un Pull Request en borrador cuando corresponda.

Utilizar GitHub Issues para definir tareas y GitHub Projects
para dar seguimiento al progreso. No marcar una tarea como
terminada antes de su integración y validación.

## 4. Reglas obligatorias de calidad

### Código

- Comprender el código existente antes de modificarlo.
- Preservar funcionalidades, interfaces y contratos existentes.
- No sobrescribir cambios ajenos ni ampliar el alcance sin autorización.
- Revisar errores, casos límite, regresiones y riesgos de seguridad.

### Testing

- Crear pruebas para nuevas funcionalidades y correcciones,
  cuando sea técnicamente viable.
- Mantener pruebas independientes, aisladas, deterministas y repetibles.
- Evitar dependencias de orden, estados mutables compartidos
  y colisiones de archivos, puertos o bases de datos.
- Liberar los recursos de prueba incluso cuando existan fallos.
- Nunca ejecutar pruebas destructivas sobre datos de producción.
- Ejecutar las pruebas pertinentes y la suite general disponible.
- No eliminar, desactivar o debilitar pruebas para aprobar validaciones.

GitHub Actions deberá ejecutar las comprobaciones configuradas:
linting, build, type checking, pruebas unitarias y de integración,
según corresponda al stack tecnológico.

No evadir las validaciones ni afirmar que una prueba fue exitosa
sin evidencia de su ejecución.

### Commits

Utilizar Conventional Commits con descripciones en español.

Formato: `tipo(alcance): descripción`

Ejemplos:

    feat(auth): implementar inicio de sesión
    fix(api): corregir validación de solicitudes
    test(auth): agregar pruebas de autenticación
    docs(readme): actualizar instrucciones de instalación

Mantener commits atómicos, descriptivos y limitados a la tarea.

### Documentación

Revisar README.md después de cada conjunto de cambios.

Actualizar únicamente las secciones afectadas cuando cambien
funcionalidades, instalación, configuración, dependencias,
variables de entorno, arquitectura o instrucciones de uso.

No reescribir el README innecesariamente ni utilizarlo
como historial de commits.

## 5. Seguridad y autonomía

### Permitido

- Inspeccionar y modificar código dentro de la tarea asignada.
- Crear y ejecutar pruebas y validaciones.
- Actualizar documentación.
- Crear ramas feature.
- Generar commits, realizar push a la feature y crear Pull Requests.
- Consultar Issues y realizar revisiones preliminares.

### Requiere autorización humana

- Modificar la arquitectura o contratos compartidos.
- Incorporar dependencias no autorizadas.
- Modificar AGENTS.md, Skills o GitHub Actions.
- Cambiar permisos o configuraciones críticas.
- Ejecutar migraciones u operaciones destructivas.
- Resolver conflictos ambiguos que afecten trabajo ajeno.

### Prohibido

- Aprobar Pull Requests como sustituto de una revisión humana.
- Realizar merges autónomos.
- Realizar pushes directos a main, development o release.
- Ejecutar force push o reescribir historial compartido.
- Eliminar ramas compartidas o descartar cambios ajenos.
- Evadir pruebas, protecciones o mecanismos de seguridad.
- Exponer credenciales, tokens, contraseñas o API keys.

Utilizar `.gitignore`, `.env`, `.env.example` y GitHub Secrets
cuando corresponda. Nunca incluir secretos reales en el repositorio.

Las restricciones críticas deben reforzarse mediante permisos
de herramientas y protección de ramas en GitHub.

## 6. Skills especializadas

Las Skills se encuentran en `.opencode/skills/`.

Cargar únicamente las necesarias según la tarea:

| Skill | Cuándo utilizarla |
|---|---|
| development | Implementación, correcciones y refactorización. |
| git-workflow | Ramas, sincronización, conflictos, commits y PR. |
| testing | Creación, aislamiento y ejecución de pruebas. |
| code-review | Inspección de cambios, seguridad y regresiones. |
| documentation | Revisión y actualización de README y documentación. |

Cada Skill contiene sus procedimientos detallados en `SKILL.md`.

Utilizar la herramienta de carga de Skills de OpenCode.
Combinar varias Skills cuando la tarea lo requiera.

Las Skills complementan AGENTS.md y no pueden contradecirlo.
Si una Skill no está disponible, comunicarlo y aplicar
las reglas generales de este archivo.

## 7. Entrega y comunicación

Antes de entregar una tarea, verificar que:

- Los requisitos estén satisfechos.
- El código haya sido revisado.
- Las validaciones aplicables hayan sido ejecutadas.
- README.md haya sido revisado y actualizado cuando corresponda.
- Los commits respeten Conventional Commits.
- El Pull Request tenga como destino la rama correcta.

El Pull Request deberá describir los cambios, Issue asociada,
pruebas ejecutadas, resultados y limitaciones conocidas.

Comunicar brevemente al usuario los cambios realizados,
validaciones, documentación actualizada y problemas pendientes.

No ocultar errores ni presentar resultados no verificados.

La integración definitiva requiere aprobación humana.

**Desarrollo ágil, validación automatizada y control humano.**
