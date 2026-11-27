
---
name: git-workflow
description: Gestiona ramas, sincronización, Conventional Commits,
  conflictos, GitHub Issues y Pull Requests, garantizando la integración
  ordenada de cambios y el control humano sobre los merges.
---

# Git Workflow

## 1. Objetivo

Gestionar el control de versiones de manera segura,
organizada y colaborativa.

Mantener la trazabilidad de los cambios, proteger el trabajo
de otros integrantes y evitar integraciones incorrectas.

Respetar las instrucciones y restricciones de AGENTS.md.

## 2. Arquitectura de ramas

El repositorio utiliza la siguiente estructura:

    main
    └── development
        ├── release/v1
        │   ├── feature/v1/login
        │   └── feature/v1/registro
        └── release/v2
            ├── feature/v2/dashboard
            └── feature/v2/reportes

### main

Contiene la versión estable del producto.

### development

Integra y valida las versiones seleccionadas y compatibles
antes de su promoción a main.

### release/vN

Representa una versión independiente del producto.

Cada release puede contener funcionalidades, implementaciones
o decisiones técnicas diferentes.

No asumir que todos los releases son compatibles entre sí.

### feature/vN/nombre

Contiene los cambios correspondientes a una tarea específica.

Cada feature deberá originarse desde su release correspondiente.

El agente únicamente podrá trabajar y realizar push
sobre la feature asignada.

## 3. Inspección del repositorio

Antes de realizar cualquier modificación, verificar:

- Estado del repositorio.
- Rama activa.
- Cambios locales existentes.
- Archivos sin seguimiento.
- Cambios preparados para commit.
- Repositorios remotos.
- Rama de destino.
- Relación con la Issue asignada.

Utilizar los comandos apropiados:

    git status
    git branch --show-current
    git branch -vv
    git remote -v
    git diff
    git diff --staged

No asumir que el directorio de trabajo está limpio.

Si existen modificaciones ajenas que interfieran con la tarea,
consultar al usuario antes de continuar.

No descartar, sobrescribir ni incluir cambios ajenos
sin autorización.

## 4. Creación de ramas

Utilizar el siguiente formato:

    feature/vN/nombre-descriptivo

Cuando exista una Issue asociada, preferir:

    feature/vN/numero-issue-descripcion

Ejemplos:

    feature/v1/login
    feature/v1/12-registro-usuarios
    feature/v2/24-dashboard
    feature/v2/31-corregir-validacion

Utilizar nombres descriptivos, minúsculas y guiones.

Antes de crear una rama:

1. Identificar el release correspondiente.
2. Actualizar las referencias remotas.
3. Verificar que la rama feature no exista previamente.
4. Confirmar que no existan cambios locales incompatibles.
5. Crear la feature desde el release remoto actualizado.

Ejemplo:

    git fetch origin
    git switch -c feature/v1/12-login origin/release/v1

Los comandos anteriores son ejemplos.

Adaptar los nombres al repositorio y a la tarea real.

No crear ramas duplicadas para una misma tarea.

No crear releases independientes sin autorización humana.

## 5. Sincronización de cambios

Antes de comenzar el desarrollo y antes de preparar
un Pull Request, consultar los cambios remotos relevantes.

Utilizar:

    git fetch origin

Inspeccionar las diferencias entre la rama local,
su referencia remota y el release correspondiente.

No ejecutar git pull de manera automática sin comprender
la estrategia de integración configurada.

Cuando sea necesario actualizar la feature:

- Verificar que el directorio de trabajo sea compatible
  con la operación.
- Identificar los cambios entrantes.
- Preservar los commits propios y ajenos.
- Respetar la estrategia de integración del equipo.
- Ejecutar nuevamente las validaciones afectadas.

No reescribir commits publicados.

No utilizar force push, incluyendo --force-with-lease.

Si la actualización requiere un merge o una reescritura
del historial, solicitar intervención humana.

## 6. Conventional Commits

Todos los commits deberán seguir Conventional Commits.

Formato:

    tipo(alcance): descripción

El alcance es opcional.

Los tipos conservarán su nomenclatura estándar en inglés.

Las descripciones deberán escribirse en español,
preferentemente utilizando verbos en infinitivo.

### Tipos

| Tipo | Propósito |
|---|---|
| feat | Incorporar una funcionalidad. |
| fix | Corregir un error. |
| docs | Modificar documentación. |
| style | Modificar formato sin alterar comportamiento. |
| refactor | Reestructurar código sin cambiar comportamiento. |
| test | Agregar o modificar pruebas. |
| chore | Realizar tareas de mantenimiento. |
| build | Modificar construcción o dependencias. |
| ci | Modificar integración continua. |
| perf | Mejorar el rendimiento. |
| revert | Revertir cambios. |

### Ejemplos válidos

    feat(auth): implementar inicio de sesión
    feat(api): agregar endpoint de usuarios
    fix(database): corregir conexión a base de datos
    fix(ui): corregir validación del formulario
    docs(readme): actualizar instrucciones de ejecución
    test(auth): agregar pruebas de autenticación
    refactor(api): simplificar procesamiento de solicitudes
    style(ui): corregir formato de componentes
    chore(deps): actualizar dependencias
    build(config): ajustar configuración de compilación
    ci(github): configurar pruebas automatizadas
    perf(search): optimizar búsqueda de registros

### Ejemplos incorrectos

    cambios
    actualización
    fix
    commit final
    arreglos varios
    ya funciona
    feat: update stuff

### Reglas

- Mantener commits pequeños, coherentes y atómicos.
- Utilizar descripciones específicas.
- Evitar mensajes ambiguos.
- No mezclar tareas independientes.
- Incluir las pruebas y documentación relacionadas
  cuando formen parte del mismo cambio lógico.
- Utilizar el cuerpo del commit cuando sea necesario
  explicar decisiones o modificaciones relevantes.
- Identificar cambios incompatibles mediante ! o
  BREAKING CHANGE cuando corresponda.

Los cambios incompatibles requieren autorización previa.

Conventional Commits no implica utilizar SemVer,
Git Tags ni GitHub Releases.

## 7. Preparación de commits

Antes de realizar un commit:

1. Inspeccionar los archivos modificados.
2. Cargar code-review y revisar las diferencias.
3. Verificar que los cambios correspondan a la tarea.
4. Ejecutar las validaciones aplicables.
5. Revisar README.md mediante documentation.
6. Preparar únicamente los archivos autorizados.
7. Inspeccionar los cambios preparados.
8. Generar el Conventional Commit correspondiente.

Preferir la selección explícita de archivos:

    git add ruta/archivo
    git diff --staged
    git commit -m "feat(auth): implementar inicio de sesión"

No utilizar git add . o git add -A indiscriminadamente.

Antes de preparar todos los archivos, verificar que ninguno
contenga cambios ajenos, secretos o archivos innecesarios.

No incluir:

- Credenciales.
- Archivos .env con secretos.
- Archivos temporales.
- Logs innecesarios.
- Dependencias instaladas localmente.
- Artefactos generados que no deban versionarse.
- Modificaciones ajenas a la tarea.

No utilizar --no-verify para evadir hooks de Git.

## 8. Push de cambios

El agente podrá realizar push exclusivamente
sobre la rama feature asignada.

Antes del push:

- Verificar la rama activa.
- Verificar los commits pendientes.
- Confirmar el repositorio remoto.
- Inspeccionar los cambios que serán publicados.
- Verificar que no existan secretos.
- Confirmar que los commits correspondan a la tarea.

Ejemplo para el primer push:

    git push -u origin feature/v1/12-login

Ejemplo para pushes posteriores:

    git push origin feature/v1/12-login

No realizar push directo hacia:

- main
- development
- release/vN
- Features de otros integrantes

Si el push es rechazado, investigar la causa.

No utilizar force push para solucionar el rechazo.

## 9. Pull Requests

El agente podrá crear Pull Requests desde su feature
hacia el release correspondiente.

Flujo:

    feature/vN/nombre -> release/vN
    release/vN -> development
    development -> main

La promoción de releases y development será gestionada
por integrantes humanos.

Antes de crear un Pull Request:

- Verificar la rama de origen.
- Verificar la rama de destino.
- Confirmar que los commits estén publicados.
- Inspeccionar las diferencias completas.
- Verificar las pruebas y validaciones disponibles.
- Confirmar que README.md haya sido revisado.
- Consultar si ya existe un Pull Request para la rama.

No crear Pull Requests duplicados.

### Título

Utilizar un título descriptivo siguiendo preferentemente
el formato de Conventional Commits.

Ejemplo:

    feat(auth): implementar inicio de sesión

### Descripción

Incluir únicamente información relevante:

    ## Cambios

    Descripción breve de la implementación.

    ## Issue relacionada

    Referencia a la Issue correspondiente, si existe.

    ## Validaciones

    Pruebas ejecutadas y resultados obtenidos.

    ## Documentación

    Cambios realizados o confirmación de revisión del README.

    ## Limitaciones

    Problemas conocidos o validaciones pendientes.

No afirmar que GitHub Actions ha finalizado correctamente
si todavía no existe evidencia de su resultado.

Utilizar un Pull Request en borrador cuando existan
problemas bloqueantes o validaciones pendientes.

Actualizar el Pull Request existente cuando se realicen
correcciones adicionales en la misma feature.

## 10. GitHub Issues y Projects

Cuando exista una Issue asociada:

- Consultar sus requisitos.
- Respetar su alcance.
- Identificar sus criterios de aceptación.
- Vincular el Pull Request correspondiente.
- Comunicar requisitos ambiguos o incompletos.

Utilizar referencias como:

    Relacionado con #12

No asumir que las palabras clave de cierre automático
cerrarán una Issue al integrar una feature en un release.

GitHub Projects podrá utilizar los siguientes estados:

- Pendiente.
- En desarrollo.
- En revisión.
- Terminado.

No marcar una tarea como terminada únicamente porque
el código fue generado, publicado o enviado mediante PR.

La finalización requiere integración y validación.

No cerrar Issues ni modificar asignaciones de otros
integrantes sin autorización.

## 11. Resolución de conflictos

Cuando exista un conflicto:

1. Identificar los archivos y commits involucrados.
2. Comprender las modificaciones de ambas partes.
3. Identificar el comportamiento esperado.
4. Evaluar la compatibilidad de los cambios.
5. Proponer una resolución que preserve el trabajo válido.
6. Solicitar intervención humana cuando exista ambigüedad.
7. Ejecutar las validaciones después de la resolución.
8. Inspeccionar las diferencias resultantes.

No resolver conflictos seleccionando automáticamente
todos los cambios de una de las partes.

No descartar modificaciones ajenas.

No utilizar estrategias destructivas para conseguir
una integración aparentemente exitosa.

El agente podrá analizar conflictos y preparar correcciones
autorizadas, pero no finalizar merges autónomamente.

## 12. Protección de ramas

Las ramas main, development y release/vN deberán
protegerse mediante las reglas disponibles en GitHub.

La configuración deberá contemplar:

- Prohibición de pushes directos.
- Integración mediante Pull Requests.
- Al menos una aprobación humana de otro integrante.
- Validaciones automatizadas satisfactorias.
- Restricción de force push.
- Restricción de eliminación de ramas protegidas.

El agente no deberá modificar estas protecciones
sin autorización humana.

No evadir las restricciones utilizando permisos elevados,
credenciales alternativas o mecanismos administrativos.

Las instrucciones de esta Skill no sustituyen
la configuración efectiva de GitHub.

## 13. GitHub Actions

Consultar el estado de las validaciones automatizadas
asociadas al Pull Request.

Cuando una validación falle:

- Inspeccionar el resultado disponible.
- Identificar la causa del fallo.
- Cargar development o testing según corresponda.
- Corregir los problemas relacionados con la tarea.
- Ejecutar las validaciones locales pertinentes.
- Generar un nuevo commit.
- Publicar la corrección en la misma feature.
- Consultar nuevamente las validaciones.

No modificar los workflows ni sus criterios de aprobación
sin autorización.

No desactivar pruebas, linters o comprobaciones
para conseguir un resultado satisfactorio.

Si el fallo es ajeno a la tarea, comunicarlo
sin modificar componentes no autorizados.

## 14. Integración de versiones

Cada release representa una versión independiente.

No fusionar releases automáticamente entre sí.

Cuando el equipo seleccione una versión del producto:

1. Verificar su estado funcional.
2. Evaluar la compatibilidad con development.
3. Ejecutar las pruebas de integración pertinentes.
4. Preparar la integración bajo supervisión humana.
5. Validar nuevamente el producto integrado.
6. Promover development hacia main mediante Pull Request.

Si existen incompatibilidades, comunicar los riesgos
y solicitar una decisión humana.

El agente no realizará estas integraciones autónomamente.

## 15. Operaciones restringidas

Está prohibido ejecutar sin autorización las operaciones
que puedan eliminar cambios o afectar el trabajo ajeno.

Prestar especial atención a:

    git reset --hard
    git clean -fd
    git clean -fdx
    git restore
    git checkout --
    git branch -D
    git push --delete

No ejecutar operaciones destructivas como solución
automática a conflictos o errores.

Está prohibido:

- Ejecutar force push.
- Reescribir el historial compartido.
- Eliminar ramas compartidas.
- Aprobar Pull Requests como sustituto de un humano.
- Realizar merges autónomos.
- Desactivar protecciones del repositorio.
- Exponer credenciales.
- Evadir validaciones automatizadas.

Ante una operación potencialmente destructiva,
explicar su propósito, impacto y alternativas.

## 16. Comunicación de resultados

Al finalizar una tarea relacionada con Git, comunicar:

- Rama utilizada.
- Commits generados.
- Estado del push.
- Pull Request creado o actualizado.
- Rama de destino.
- Estado conocido de GitHub Actions.
- Conflictos o limitaciones pendientes.

No presentar operaciones pendientes como completadas.

No afirmar que un Pull Request fue integrado
sin verificar su estado.

La decisión final de integración corresponde
exclusivamente al equipo humano.
