
---
name: development
description: Implementa funcionalidades, corrige errores y refactoriza
  código respetando la arquitectura, los requisitos y las convenciones
  del proyecto, priorizando simplicidad y mantenibilidad.
---

# Development

## 1. Objetivo

Desarrollar soluciones funcionales, seguras y mantenibles
dentro del alcance de la tarea asignada.

Priorizar la entrega de valor al producto sobre la perfección
técnica y la complejidad innecesaria.

Respetar las instrucciones y restricciones de AGENTS.md.

## 2. Análisis previo

Antes de modificar código:

- Comprender los requisitos y criterios de aceptación.
- Consultar la Issue asociada, cuando exista.
- Identificar el stack tecnológico y sus convenciones.
- Inspeccionar la estructura y arquitectura del proyecto.
- Localizar los componentes relacionados con la tarea.
- Identificar funcionalidades existentes que puedan reutilizarse.
- Verificar las dependencias disponibles.
- Identificar posibles efectos secundarios y regresiones.
- Revisar los cambios existentes de otros integrantes.

No asumir la existencia de archivos, funciones, bibliotecas,
interfaces o configuraciones sin verificarlo.

Consultar al usuario cuando una ambigüedad afecte
significativamente el resultado de la implementación.

## 3. Planificación

Definir un plan breve y proporcional a la complejidad
de la tarea.

Identificar:

- Qué comportamiento debe implementarse o corregirse.
- Qué componentes deben modificarse.
- Qué código existente puede reutilizarse.
- Qué dependencias o interfaces pueden verse afectadas.
- Qué pruebas permitirán verificar el resultado.

Preferir la solución más simple que satisfaga los requisitos
sin comprometer la seguridad ni el funcionamiento del producto.

No generar planes extensos para tareas sencillas.

## 4. Principios de desarrollo

### KISS — Keep It Simple, Stupid

- Preferir soluciones directas y comprensibles.
- Evitar abstracciones innecesarias.
- Evitar patrones de diseño que no resuelvan problemas reales.
- Reducir la complejidad accidental.

### DRY — Don't Repeat Yourself

- Reutilizar funcionalidades existentes.
- Evitar duplicar lógica de negocio.
- Centralizar comportamientos comunes cuando aporte valor.
- No crear abstracciones prematuras únicamente para eliminar
  pequeñas similitudes entre componentes.

### YAGNI — You Aren't Gonna Need It

- Implementar únicamente los requisitos actuales.
- No desarrollar funcionalidades hipotéticas.
- No incorporar dependencias para necesidades futuras.
- Evitar configuraciones y extensiones que todavía no se requieren.

### Separation of Concerns

- Separar responsabilidades según la arquitectura existente.
- Mantener componentes enfocados en su propósito.
- Evitar mezclar lógica de negocio, presentación y acceso
  a datos cuando el proyecto contemple dicha separación.
- Reducir el acoplamiento innecesario entre componentes.

Aplicar estos principios de manera pragmática.
No imponer patrones que compliquen una solución sencilla.

## 5. Implementación

Durante el desarrollo:

- Respetar la estructura y convenciones del proyecto.
- Utilizar nombres descriptivos y consistentes.
- Escribir código legible y fácil de modificar.
- Mantener funciones y componentes con responsabilidades claras.
- Utilizar las herramientas y bibliotecas existentes.
- Validar entradas y resultados cuando corresponda.
- Manejar errores y casos límite relevantes.
- Liberar correctamente los recursos utilizados.
- Preservar la compatibilidad con funcionalidades existentes.
- Limitar los cambios a los archivos realmente necesarios.

Evitar:

- Código duplicado injustificadamente.
- Código muerto o importaciones sin utilizar.
- Valores codificados directamente sin justificación.
- Funciones o interfaces innecesarias.
- Comentarios que repitan lo evidente.
- Manejo silencioso de errores.
- Implementaciones incompletas presentadas como funcionales.
- Modificaciones de formato ajenas a la tarea.
- Refactorizaciones masivas no solicitadas.

Los comentarios deberán explicar decisiones no evidentes,
restricciones o comportamientos complejos.

## 6. Arquitectura e integración

Antes de modificar un componente compartido:

- Identificar sus consumidores.
- Comprender sus interfaces y contratos.
- Evaluar el impacto sobre otras funcionalidades.
- Preservar la compatibilidad cuando sea posible.

No modificar sin autorización:

- La arquitectura general del proyecto.
- Los contratos compartidos de manera incompatible.
- Los esquemas de datos que afecten a otros integrantes.
- Las configuraciones críticas.
- Las interfaces públicas de otros componentes.

No reorganizar el proyecto únicamente por preferencias
personales de implementación.

Cuando una modificación estructural sea necesaria,
explicar su justificación, impacto y alternativas.

## 7. Gestión de dependencias

Antes de incorporar una dependencia:

1. Verificar si ya existe una solución en el proyecto.
2. Evaluar si el lenguaje o framework proporciona
   la funcionalidad requerida.
3. Determinar si la dependencia aporta valor suficiente.
4. Revisar compatibilidad, mantenimiento, licencia y seguridad.
5. Solicitar autorización humana cuando corresponda.

Utilizar el gestor de paquetes establecido en el repositorio.

No cambiar versiones de dependencias ajenas a la tarea.
No introducir gestores de paquetes adicionales.
No modificar manualmente archivos de bloqueo generados
cuando exista una herramienta apropiada para actualizarlos.

No utilizar bibliotecas, funciones o APIs inexistentes.

Verificar la documentación correspondiente a la versión
realmente utilizada por el proyecto cuando sea necesario.

## 8. Corrección de errores

Cuando la tarea consista en corregir un error:

1. Comprender el comportamiento esperado.
2. Identificar el comportamiento incorrecto.
3. Reproducir el problema cuando sea posible.
4. Localizar su causa raíz.
5. Implementar la corrección mínima necesaria.
6. Crear o actualizar una prueba de regresión.
7. Verificar que el problema haya sido resuelto.
8. Comprobar que no se introdujeron regresiones.

No limitarse a ocultar los síntomas del error.

No utilizar excepciones genéricas, valores arbitrarios
o condiciones artificiales para evitar un fallo
sin comprender su causa.

Si no es posible reproducir el problema, comunicar
las limitaciones y distinguir las hipótesis de los hechos.

## 9. Refactorización

La refactorización deberá mejorar la estructura interna
del código sin modificar su comportamiento observable.

Antes de refactorizar:

- Identificar el problema que se desea resolver.
- Comprender el comportamiento actual.
- Verificar la existencia de pruebas relevantes.
- Evaluar si el beneficio justifica el cambio.

Durante la refactorización:

- Realizar cambios pequeños y verificables.
- Preservar interfaces y contratos existentes.
- Evitar mezclar refactorizaciones con funcionalidades
  independientes.
- Mantener la compatibilidad con otros componentes.

Después de refactorizar, ejecutar las pruebas pertinentes.

No refactorizar componentes ajenos a la tarea sin autorización.

## 10. Seguridad

Aplicar medidas de seguridad proporcionales al componente:

- Validar entradas provenientes de fuentes no confiables.
- Verificar autenticación y autorización cuando corresponda.
- Evitar inyecciones de código y consultas.
- Proteger información sensible.
- Utilizar permisos mínimos necesarios.
- Manejar archivos y rutas de forma segura.
- Evitar exponer detalles internos mediante mensajes de error.
- No registrar credenciales ni información sensible.

Utilizar mecanismos de seguridad establecidos en el proyecto.

No implementar mecanismos criptográficos propios cuando
existan alternativas confiables y adecuadas.

No desactivar controles de seguridad para facilitar
el desarrollo o conseguir que una funcionalidad opere.

## 11. Desarrollo colaborativo

El proyecto será desarrollado simultáneamente por varios
integrantes y agentes de inteligencia artificial.

Por lo tanto:

- Trabajar exclusivamente dentro del alcance asignado.
- Respetar las interfaces utilizadas por otros integrantes.
- Evitar modificar componentes compartidos innecesariamente.
- No sobrescribir cambios existentes.
- No descartar modificaciones ajenas.
- Comunicar incompatibilidades y dependencias entre tareas.
- Evitar cambios globales que dificulten la integración.

Cuando exista un conflicto entre implementaciones,
no elegir arbitrariamente una solución que descarte
el trabajo de otro integrante.

Cargar git-workflow cuando sea necesario gestionar
ramas, sincronización o conflictos.

## 12. Priorización durante la hackathon

Priorizar en el siguiente orden:

1. Cumplimiento de los requisitos esenciales.
2. Funcionamiento correcto del producto.
3. Seguridad e integridad de los datos.
4. Compatibilidad e integración.
5. Mantenibilidad y legibilidad.
6. Optimización del rendimiento cuando esté justificada.
7. Mejoras secundarias.

Este orden no autoriza comprometer requisitos críticos
de seguridad para acelerar el desarrollo.

Evitar optimizaciones prematuras.

Cuando una solución temporal sea necesaria:

- Comunicar su propósito y limitaciones.
- Mantenerla claramente identificada.
- Evitar comprometer datos, seguridad o funcionalidades críticas.
- Solicitar autorización si introduce deuda técnica relevante.

No presentar una solución temporal como definitiva.

## 13. Validación y entrega

Después de implementar los cambios:

- Cargar testing para crear y ejecutar las pruebas pertinentes.
- Cargar code-review para inspeccionar los cambios.
- Cargar documentation para revisar README.md.
- Cargar git-workflow para gestionar commits, push y PR.

Verificar que la implementación:

- Cumpla los requisitos establecidos.
- Preserve el comportamiento existente.
- No introduzca dependencias injustificadas.
- No contenga cambios fuera del alcance autorizado.
- Cuente con validaciones apropiadas.
- No introduzca riesgos de seguridad conocidos.

Comunicar los problemas pendientes y las limitaciones.

No declarar una funcionalidad como completa sin evidencia
suficiente de su funcionamiento.

La integración definitiva permanece bajo control humano.
