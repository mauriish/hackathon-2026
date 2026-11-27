
---
name: code-review
description: Revisa cambios de código, detecta errores, regresiones,
  vulnerabilidades y problemas de mantenibilidad antes de generar
  commits, Pull Requests o solicitar una integración.
---

# Code Review

## 1. Objetivo

Verificar la calidad, seguridad y funcionamiento del código
modificado antes de su integración al repositorio.

Priorizar problemas que afecten el funcionamiento del producto
sobre preferencias personales de estilo.

La revisión automatizada complementa, pero nunca sustituye,
la aprobación humana establecida en AGENTS.md.

## 2. Inspección inicial

Antes de comenzar una revisión:

- Consultar los requisitos de la tarea o Issue asociada.
- Identificar la rama activa y su rama de destino.
- Inspeccionar el estado del repositorio.
- Identificar los archivos modificados, agregados y eliminados.
- Revisar los cambios preparados y no preparados para commit.
- Comparar los cambios con la rama de destino correspondiente.
- Comprender el contexto del código afectado.

Utilizar los comandos de Git apropiados:

    git status
    git diff
    git diff --staged
    git diff --stat

No asumir que revisar únicamente los archivos modificados
es suficiente. Inspeccionar también los componentes relacionados
cuando exista riesgo de regresión.

## 3. Criterios de revisión

### Correctitud

Verificar:

- Cumplimiento de los requisitos.
- Errores de lógica y condiciones incorrectas.
- Manejo de valores nulos, vacíos o inválidos.
- Casos límite.
- Manejo de excepciones y errores.
- Resultados inesperados.
- Implementaciones incompletas.
- Comportamientos no contemplados.

### Integración y regresiones

Verificar:

- Compatibilidad con funcionalidades existentes.
- Cambios en interfaces y contratos compartidos.
- Compatibilidad entre componentes.
- Modificaciones fuera del alcance de la tarea.
- Cambios que puedan afectar el trabajo de otros integrantes.
- Dependencias circulares o innecesarias.
- Alteraciones injustificadas de configuraciones globales.

### Calidad y mantenibilidad

Verificar:

- Claridad y legibilidad.
- Nombres descriptivos.
- Duplicación innecesaria.
- Código muerto o sin utilizar.
- Complejidad innecesaria.
- Coherencia con la arquitectura existente.
- Reutilización de componentes disponibles.
- Manejo adecuado de recursos.

No solicitar refactorizaciones innecesarias que no aporten
valor directo a la tarea.

### Seguridad

Identificar, cuando corresponda:

- Credenciales o secretos expuestos.
- Entradas de usuario sin validar.
- Inyecciones de código o consultas.
- Errores de autenticación y autorización.
- Exposición de información sensible.
- Dependencias potencialmente vulnerables.
- Permisos excesivos.
- Operaciones destructivas no autorizadas.
- Manejo inseguro de archivos y rutas.
- Información sensible incluida en logs.

No ejecutar operaciones peligrosas para demostrar
una vulnerabilidad.

### Código generado por IA

Prestar especial atención a:

- Funciones, métodos o APIs inexistentes.
- Importaciones y dependencias inventadas.
- Uso incorrecto de bibliotecas existentes.
- Suposiciones incorrectas sobre el proyecto.
- Código aparentemente funcional pero incompleto.
- Manejo superficial de errores.
- Valores codificados directamente sin justificación.
- Soluciones excesivamente complejas.
- Comentarios que no coincidan con el comportamiento real.
- Implementaciones duplicadas de funcionalidades existentes.

Verificar las afirmaciones del código mediante evidencia,
no asumir que son correctas porque fueron generadas por IA.

## 4. Verificación de pruebas

Cargar la Skill testing cuando sea necesario.

Comprobar que:

- Las pruebas cubran el comportamiento introducido.
- Existan casos exitosos, fallidos y casos límite relevantes.
- Las pruebas sean independientes y reproducibles.
- No existan dependencias de orden de ejecución.
- No se compartan estados mutables sin aislamiento.
- Los recursos temporales se liberen correctamente.
- Las pruebas no interfieran con otros componentes.
- Las pruebas existentes no hayan sido debilitadas.
- Los resultados esperados correspondan a los requisitos.

Ejecutar las validaciones disponibles según el proyecto:

- Linting.
- Type checking.
- Build o compilación.
- Pruebas unitarias.
- Pruebas de integración.
- Pruebas de regresión.

No inventar comandos ni herramientas de validación.

Distinguir entre comprobaciones exitosas, fallidas,
no ejecutadas y no disponibles.

Nunca considerar una validación exitosa sin evidencia.

## 5. Clasificación de hallazgos

Clasificar los problemas según su impacto real.

### CRÍTICO

Problemas que pueden provocar:

- Vulnerabilidades graves.
- Pérdida o corrupción de datos.
- Exposición de credenciales.
- Fallos graves del producto.
- Operaciones destructivas.

Bloquea la integración.

### ALTO

Problemas que pueden provocar:

- Incumplimiento de requisitos.
- Regresiones funcionales.
- Errores importantes de lógica.
- Fallos de integración.
- Pruebas relevantes fallidas.

Bloquea la integración.

### MEDIO

Problemas relacionados con:

- Mantenibilidad.
- Manejo insuficiente de casos secundarios.
- Duplicación relevante.
- Rendimiento mejorable.
- Cobertura insuficiente de escenarios secundarios.

Evaluar si requieren corrección antes de integrar.
Elevar su severidad cuando exista un riesgo funcional.

### BAJO

Observaciones relacionadas con:

- Legibilidad.
- Nomenclatura.
- Formato.
- Mejoras menores.

No bloquear la integración únicamente por preferencias
de estilo que no incumplan las reglas del proyecto.

## 6. Comunicación de hallazgos

Cada hallazgo deberá incluir:

- Severidad.
- Archivo y línea, cuando sea posible.
- Descripción del problema.
- Impacto sobre el producto.
- Evidencia disponible.
- Corrección recomendada.

Ejemplo:

    [ALTO] src/auth/login — línea 42

    Problema:
    No se valida si el usuario existe antes de acceder
    a sus propiedades.

    Impacto:
    Puede provocar un error durante el inicio de sesión.

    Recomendación:
    Validar la existencia del usuario y manejar
    correctamente el caso de autenticación fallida.

Evitar reportar problemas hipotéticos sin fundamento.
Distinguir defectos confirmados de riesgos no verificados.
No inventar hallazgos para justificar una revisión.

## 7. Corrección de hallazgos

Cuando se revisen cambios propios:

- Corregir los problemas dentro del alcance autorizado.
- Cargar development si se requiere modificar código.
- Cargar testing si se requiere modificar pruebas.
- Ejecutar nuevamente las validaciones afectadas.
- Revisar las diferencias después de cada corrección.

Cuando se revise código de otro integrante:

- Comunicar los hallazgos y recomendaciones.
- No modificar su rama sin autorización.
- No sobrescribir cambios ajenos.

Cuando la tarea sea exclusivamente de revisión,
no modificar el código sin autorización.

## 8. Resultado de la revisión

Emitir un resultado breve:

- Estado: LISTO PARA REVISIÓN HUMANA,
  REQUIERE CORRECCIONES o VALIDACIÓN INCOMPLETA.
- Hallazgos relevantes, ordenados por severidad.
- Validaciones ejecutadas y sus resultados.
- Validaciones pendientes.
- Riesgos o limitaciones conocidas.

Utilizar LISTO PARA REVISIÓN HUMANA únicamente cuando
no existan problemas bloqueantes conocidos y las
validaciones requeridas sean satisfactorias.

Utilizar REQUIERE CORRECCIONES cuando existan
problemas bloqueantes.

Utilizar VALIDACIÓN INCOMPLETA cuando no exista evidencia
suficiente para determinar la calidad de los cambios.

No confundir una revisión satisfactoria con una garantía
de ausencia absoluta de errores.

## 9. Restricciones

- Respetar AGENTS.md.
- No aprobar Pull Requests en sustitución de un humano.
- No realizar merges autónomos.
- No desactivar pruebas, linters o mecanismos de seguridad.
- No modificar GitHub Actions sin autorización.
- No ocultar errores ni validaciones fallidas.
- No modificar código ajeno sin autorización.
- No ampliar innecesariamente el alcance de la revisión.

La decisión final de integración corresponde al equipo humano.
