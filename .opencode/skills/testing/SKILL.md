
---
name: testing
description: Diseña, implementa y ejecuta pruebas unitarias, de integración
  y regresión, garantizando independencia, aislamiento, determinismo,
  reproducibilidad y limpieza de recursos.
---

# Testing

## 1. Objetivo

Verificar el comportamiento del producto mediante pruebas
confiables, independientes y reproducibles.

Detectar errores, prevenir regresiones y facilitar la integración
segura de funcionalidades desarrolladas simultáneamente.

Priorizar pruebas que aporten valor real al producto.

Respetar las instrucciones y restricciones de AGENTS.md.

## 2. Inspección del entorno

Antes de crear o ejecutar pruebas:

- Identificar el stack tecnológico.
- Identificar el framework de testing existente.
- Inspeccionar la estructura de las pruebas.
- Consultar los comandos de validación disponibles.
- Revisar las configuraciones de testing.
- Identificar fixtures, mocks y utilidades reutilizables.
- Identificar servicios y dependencias externas.
- Revisar los workflows de GitHub Actions.
- Identificar las pruebas relacionadas con la tarea.

Respetar las convenciones existentes.

No introducir frameworks de testing adicionales
sin autorización humana.

No inventar comandos, configuraciones o herramientas.

## 3. Estrategia de testing

Seleccionar las pruebas según el comportamiento,
la complejidad y el riesgo de la funcionalidad.

### Pruebas unitarias

Verificar unidades de comportamiento de manera aislada.

Utilizar para:

- Funciones.
- Algoritmos.
- Validaciones.
- Transformaciones de datos.
- Reglas de negocio.
- Manejo de errores.
- Casos límite.

Evitar dependencias innecesarias de servicios externos,
redes, sistemas de archivos y bases de datos reales.

### Pruebas de integración

Verificar la interacción entre componentes.

Utilizar para:

- Comunicación entre módulos.
- APIs.
- Acceso a bases de datos.
- Autenticación y autorización.
- Interacción entre servicios.
- Persistencia de información.
- Contratos entre componentes.

Utilizar entornos y recursos de prueba controlados.

### Pruebas de regresión

Verificar que los cambios no afecten comportamientos
previamente funcionales.

Cuando se corrija un error, agregar una prueba que permita
detectar nuevamente el defecto si este reaparece.

### Pruebas end-to-end

Cuando el proyecto disponga de herramientas adecuadas,
verificar flujos completos del usuario.

Priorizar los recorridos esenciales del producto.

No introducir infraestructura compleja de testing
cuando su costo no esté justificado.

## 4. Diseño de pruebas

Cada prueba deberá verificar un comportamiento concreto
y claramente identificable.

Considerar:

- Escenarios exitosos.
- Escenarios fallidos.
- Entradas inválidas.
- Valores nulos o vacíos.
- Casos límite.
- Manejo de errores.
- Restricciones de seguridad.
- Comportamientos inesperados.

Utilizar nombres descriptivos que indiquen
el comportamiento esperado.

Preferir la estructura Arrange, Act, Assert.

### Arrange

Preparar los datos, dependencias y condiciones iniciales.

### Act

Ejecutar el comportamiento que se desea verificar.

### Assert

Comprobar que el resultado coincide con el esperado.

Evitar pruebas excesivamente complejas.

Verificar comportamientos observables en lugar de depender
innecesariamente de detalles internos de implementación.

## 5. Independencia de pruebas

Cada prueba deberá poder ejecutarse individualmente.

Está prohibido diseñar pruebas que dependan de:

- La ejecución previa de otra prueba.
- Un orden específico de ejecución.
- Datos generados por otra prueba.
- Estados globales modificados por otras pruebas.
- Recursos que otra prueba deba preparar.
- Resultados obtenidos en ejecuciones anteriores.

Cada prueba deberá establecer sus propias precondiciones.

La ejecución de una prueba no deberá alterar
el resultado de las demás.

Cuando el framework lo permita, verificar que las pruebas
puedan ejecutarse individualmente y como parte de la suite.

## 6. Aislamiento de pruebas

Las pruebas deberán utilizar recursos aislados
y estados controlados.

Evitar compartir estados mutables entre pruebas.

Prestar especial atención a:

- Variables globales.
- Variables de entorno.
- Bases de datos.
- Archivos temporales.
- Directorios.
- Puertos de red.
- Cachés.
- Sesiones.
- Identificadores.
- Servicios externos.
- Conexiones persistentes.

Cuando se utilicen recursos compartidos,
garantizar que no exista interferencia entre pruebas.

Restaurar cualquier estado global modificado
durante la ejecución.

No utilizar recursos compartidos con otros integrantes
sin mecanismos adecuados de aislamiento.

## 7. Determinismo y reproducibilidad

Una prueba deberá producir resultados consistentes
cuando se ejecute bajo las mismas condiciones.

Controlar, cuando corresponda:

- Generación de números aleatorios.
- Semillas aleatorias.
- Fechas y horarios.
- Zonas horarias.
- Configuración regional.
- Variables de entorno.
- Orden de ejecución.
- Respuestas de servicios externos.
- Condiciones de concurrencia.

Evitar depender de:

- La fecha u hora real del sistema.
- Servicios externos no controlados.
- Datos que cambian constantemente.
- Condiciones de red impredecibles.
- Esperas arbitrarias.

Preferir mecanismos de sincronización y condiciones
verificables en lugar de tiempos de espera fijos.

Las pruebas deberán poder ejecutarse repetidamente
sin producir efectos secundarios acumulativos.

## 8. Fixtures y datos de prueba

Utilizar fixtures, factories o mecanismos equivalentes
cuando el framework existente los proporcione.

Los datos de prueba deberán ser:

- Controlados.
- Representativos.
- Independientes.
- Reproducibles.
- Suficientes para verificar el comportamiento.

Preferir datos sintéticos.

No utilizar información personal, credenciales reales
ni datos sensibles de producción.

Evitar fixtures excesivamente grandes o complejos.

Las fixtures compartidas deberán ser inmutables
o generar instancias independientes para cada prueba.

No modificar una fixture compartida de manera que
afecte a otras pruebas.

## 9. Mocks, stubs y dependencias externas

Utilizar dobles de prueba cuando sea necesario
aislar dependencias o controlar comportamientos.

Pueden utilizarse para:

- APIs externas.
- Servicios de terceros.
- Envío de correos.
- Sistemas de archivos.
- Generadores aleatorios.
- Relojes del sistema.
- Servicios de autenticación.
- Dependencias costosas o no deterministas.

Utilizar las herramientas existentes en el proyecto.

Evitar mocks innecesarios.

No simular el comportamiento principal que se pretende
verificar únicamente para conseguir una prueba exitosa.

Los mocks deberán representar contratos reales.

No asumir que una integración funciona únicamente
porque sus dependencias simuladas respondieron correctamente.

Restaurar los mocks y configuraciones modificadas
al finalizar cada prueba.

## 10. Bases de datos y persistencia

Las pruebas que utilicen bases de datos deberán ejecutarse
en entornos de prueba aislados.

Utilizar, según las capacidades del proyecto:

- Bases de datos temporales.
- Bases de datos exclusivas para testing.
- Esquemas independientes.
- Transacciones con rollback.
- Contenedores aislados.
- Identificadores exclusivos.
- Datos sintéticos.

Antes de ejecutar pruebas que modifiquen datos,
verificar que la conexión corresponda al entorno de pruebas.

Si no puede confirmarse el aislamiento,
no ejecutar operaciones que modifiquen o eliminen datos.

Está prohibido:

- Ejecutar pruebas destructivas en producción.
- Eliminar información real.
- Utilizar credenciales de producción innecesariamente.
- Modificar bases de datos compartidas sin aislamiento.
- Ejecutar migraciones destructivas sin autorización.

Cada prueba deberá preparar y limpiar los datos
que utilice.

No depender de registros residuales de pruebas anteriores.

## 11. Concurrencia y ejecución paralela

Las pruebas podrán ejecutarse en paralelo cuando
el framework y los recursos utilizados lo permitan.

Prevenir colisiones mediante:

- Puertos dinámicos o exclusivos.
- Directorios temporales independientes.
- Identificadores únicos.
- Bases de datos o esquemas aislados.
- Instancias independientes de objetos mutables.
- Configuraciones de entorno controladas.

Evitar condiciones de carrera y dependencias temporales.

No asumir que una prueba es segura para ejecución paralela
únicamente porque funciona de manera individual.

Cuando una prueba no pueda aislarse adecuadamente,
configurar su ejecución secuencial de manera explícita
y justificar la restricción.

No desactivar el paralelismo de toda la suite
para ocultar problemas de aislamiento individuales.

## 12. Limpieza de recursos

Liberar los recursos creados durante las pruebas,
incluso cuando existan fallos o excepciones.

Esto incluye:

- Archivos y directorios temporales.
- Conexiones a bases de datos.
- Registros de prueba.
- Procesos secundarios.
- Servidores temporales.
- Puertos de red.
- Sesiones.
- Mocks.
- Contenedores.
- Variables de entorno modificadas.

Utilizar los mecanismos de setup y teardown
proporcionados por el framework.

No eliminar recursos que no pertenezcan
a la ejecución de prueba correspondiente.

La limpieza deberá preservar el entorno original
y el trabajo de otros integrantes.

## 13. Pruebas de regresión

Cuando se corrija un defecto:

1. Identificar el comportamiento incorrecto.
2. Reproducir el error mediante una prueba cuando sea viable.
3. Confirmar que la prueba detecta el defecto.
4. Implementar la corrección.
5. Ejecutar nuevamente la prueba.
6. Ejecutar las pruebas relacionadas.
7. Ejecutar la suite general disponible.

No considerar suficiente una prueba que únicamente
verifique el escenario exitoso.

Cuando se modifique una funcionalidad existente,
evaluar los componentes que puedan verse afectados.

Después de sincronizar cambios o resolver conflictos,
ejecutar nuevamente las pruebas pertinentes.

## 14. Integridad de las pruebas

Las pruebas deberán detectar defectos reales.

Está prohibido:

- Eliminar pruebas para conseguir una validación exitosa.
- Desactivar pruebas que detecten errores reales.
- Debilitar assertions injustificadamente.
- Cambiar resultados esperados para ocultar defectos.
- Ignorar excepciones que deberían provocar un fallo.
- Introducir condiciones artificiales para aprobar pruebas.
- Ocultar fallos mediante mocks incorrectos.
- Reducir criterios de cobertura sin autorización.
- Evadir comprobaciones de GitHub Actions.
- Presentar pruebas no ejecutadas como exitosas.

Las modificaciones de pruebas deberán responder
a cambios legítimos de requisitos o correcciones justificadas.

Cuando una prueba existente necesite modificarse,
explicar el motivo y verificar que conserve
su capacidad para detectar defectos.

## 15. Cobertura de pruebas

Priorizar la cobertura de comportamientos relevantes
sobre alcanzar porcentajes arbitrarios.

Prestar especial atención a:

- Funcionalidades esenciales.
- Reglas de negocio.
- Autenticación y autorización.
- Validación de entradas.
- Persistencia de información.
- Integración entre componentes.
- Manejo de errores.
- Defectos previamente corregidos.

Respetar los criterios de cobertura existentes.

No generar pruebas sin valor únicamente para aumentar
las métricas de cobertura.

Una cobertura elevada no garantiza la ausencia de errores.

No imponer porcentajes mínimos nuevos sin autorización.

## 16. Ejecución de validaciones

Antes de entregar una funcionalidad, ejecutar
las validaciones disponibles y aplicables.

Según el stack tecnológico:

- Linting.
- Type checking.
- Build o compilación.
- Pruebas unitarias.
- Pruebas de integración.
- Pruebas de regresión.
- Pruebas end-to-end.

Durante el desarrollo, ejecutar primero las pruebas
directamente relacionadas con la tarea.

Antes del Pull Request, ejecutar la suite general
disponible y las comprobaciones requeridas.

Utilizar los comandos establecidos en el repositorio.

No modificar configuraciones globales para conseguir
que las validaciones sean exitosas.

## 17. Análisis de pruebas fallidas

Cuando una prueba falle:

1. Inspeccionar el mensaje de error.
2. Identificar las condiciones de ejecución.
3. Reproducir el fallo cuando sea posible.
4. Determinar si el problema pertenece al código,
   a la prueba o al entorno.
5. Identificar la causa raíz.
6. Corregir el problema dentro del alcance autorizado.
7. Ejecutar nuevamente las pruebas afectadas.
8. Verificar que no se introdujeron regresiones.

No asumir automáticamente que una prueba fallida
es incorrecta.

Si el fallo es preexistente o ajeno a la tarea,
comunicarlo con evidencia.

No modificar componentes ajenos sin autorización.

Si una prueba presenta resultados intermitentes,
investigar su aislamiento, determinismo y concurrencia.

No repetir pruebas indefinidamente hasta obtener
un resultado exitoso.

Un resultado exitoso posterior no invalida
automáticamente un fallo anterior.

## 18. GitHub Actions

Las pruebas deberán poder ejecutarse mediante
las validaciones automatizadas del proyecto.

Mantener consistencia entre el entorno local
y el entorno de integración continua.

Cuando una prueba funcione localmente pero falle
en GitHub Actions, revisar:

- Versiones de herramientas.
- Dependencias.
- Variables de entorno.
- Configuración del sistema.
- Disponibilidad de servicios.
- Rutas de archivos.
- Permisos.
- Condiciones de concurrencia.

No asumir que una validación local exitosa
garantiza el éxito de GitHub Actions.

No modificar workflows ni criterios de aprobación
sin autorización humana.

Cargar git-workflow cuando sea necesario consultar
las validaciones asociadas a un Pull Request.

## 19. Priorización durante la hackathon

Priorizar las pruebas según el riesgo del producto:

1. Funcionalidades esenciales para la demostración.
2. Seguridad e integridad de los datos.
3. Reglas de negocio críticas.
4. Integración entre componentes.
5. Correcciones de errores y regresiones.
6. Casos límite relevantes.
7. Comportamientos secundarios.

No dedicar tiempo excesivo a pruebas de bajo valor
mientras existan funcionalidades críticas sin validar.

Esta priorización no autoriza omitir comprobaciones
obligatorias ni ocultar riesgos de seguridad.

Preferir pruebas pequeñas, rápidas y confiables.

## 20. Comunicación de resultados

Al finalizar, comunicar brevemente:

- Pruebas creadas o modificadas.
- Comandos ejecutados.
- Pruebas exitosas.
- Pruebas fallidas.
- Pruebas omitidas.
- Validaciones no ejecutadas.
- Problemas de aislamiento detectados.
- Limitaciones del entorno.
- Estado conocido de GitHub Actions.

Distinguir claramente entre:

- EXITOSA: ejecutada con resultado satisfactorio.
- FALLIDA: ejecutada con resultado incorrecto.
- OMITIDA: excluida explícitamente de la ejecución.
- NO EJECUTADA: pendiente de ejecución.
- NO DISPONIBLE: no puede ejecutarse con el entorno actual.

No inventar resultados, cantidades de pruebas
ni porcentajes de cobertura.

Cargar code-review para inspeccionar la calidad
de los cambios antes de su integración.

Las pruebas satisfactorias aportan evidencia
del funcionamiento del producto, pero no garantizan
la ausencia absoluta de defectos.
