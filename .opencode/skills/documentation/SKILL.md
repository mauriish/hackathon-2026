
---
name: documentation
description: Mantiene la documentación sincronizada con el código,
  revisa y actualiza README.md, documenta funcionalidades, dependencias,
  configuraciones, variables de entorno e instrucciones de uso.
---

# Documentation

## 1. Objetivo

Mantener una documentación clara, precisa, útil y actualizada
que refleje el estado real del proyecto.

Priorizar la información necesaria para comprender, instalar,
configurar, ejecutar, probar y utilizar el producto.

Respetar las instrucciones y restricciones de AGENTS.md.

## 2. Revisión obligatoria del README

Después de cada conjunto de cambios, revisar README.md
y determinar si su contenido continúa siendo válido.

Actualizarlo cuando existan cambios que afecten:

- Funcionalidades del producto.
- Requisitos del sistema.
- Tecnologías utilizadas.
- Dependencias relevantes.
- Procedimientos de instalación.
- Configuraciones del proyecto.
- Variables de entorno.
- Comandos de ejecución.
- Comandos de compilación.
- Comandos de testing.
- Arquitectura y estructura del proyecto.
- Interfaces públicas.
- Instrucciones de uso.
- Limitaciones conocidas relevantes.

Si los cambios son exclusivamente internos y no afectan
la información documentada, no modificar README.md.

La revisión es obligatoria; la modificación es condicional.

## 3. Estructura del README

Respetar la estructura existente del documento.

Cuando sea necesario crear o ampliar README.md,
considerar las siguientes secciones:

- Nombre del proyecto.
- Descripción y propósito.
- Funcionalidades disponibles.
- Stack tecnológico.
- Requisitos previos.
- Instalación.
- Configuración.
- Variables de entorno.
- Ejecución.
- Testing.
- Arquitectura y estructura del proyecto.
- Contribución y flujo de trabajo.
- Limitaciones conocidas.

Incluir únicamente las secciones relevantes para el proyecto.

No crear secciones vacías ni agregar contenido de relleno.

No imponer una estructura nueva cuando la existente
sea suficiente y funcional.

## 4. Exactitud de la documentación

Toda información documentada deberá corresponder
al estado real del repositorio.

Antes de documentar:

- Inspeccionar los archivos relacionados.
- Verificar las dependencias y versiones existentes.
- Consultar las configuraciones del proyecto.
- Comprobar los comandos disponibles.
- Verificar el comportamiento de las funcionalidades.
- Identificar requisitos y restricciones reales.

No documentar:

- Funcionalidades inexistentes.
- Comandos inventados.
- Dependencias no utilizadas.
- Configuraciones incorrectas.
- Resultados de pruebas no ejecutadas.
- Características futuras como si estuvieran implementadas.
- Compatibilidad con plataformas no verificadas.

Distinguir entre información verificada, requisitos
establecidos y limitaciones pendientes.

## 5. Instalación y ejecución

Las instrucciones deberán permitir que otro integrante
prepare y ejecute el proyecto de manera reproducible.

Documentar, cuando corresponda:

- Requisitos previos.
- Versiones necesarias.
- Instalación de dependencias.
- Configuración del entorno.
- Inicialización de servicios.
- Preparación de bases de datos.
- Comandos de desarrollo.
- Comandos de compilación.
- Comandos de ejecución.

Presentar los comandos en bloques de código Markdown.

Utilizar los gestores de paquetes y herramientas
establecidos en el repositorio.

No inventar comandos ni asumir configuraciones inexistentes.

Verificar los comandos cuando sea técnicamente viable.
Comunicar aquellos que no hayan podido comprobarse.

## 6. Variables de entorno

Mantener consistencia entre README.md, .env.example
y las variables utilizadas por el código.

Cuando se introduzca, modifique o elimine una variable:

- Revisar .env.example.
- Actualizar la documentación correspondiente.
- Explicar su propósito.
- Indicar si es obligatoria u opcional.
- Documentar valores predeterminados cuando existan.
- Identificar restricciones de configuración relevantes.

Utilizar valores ficticios o marcadores descriptivos.

Nunca documentar ni publicar:

- Contraseñas reales.
- Tokens de acceso.
- API keys reales.
- Credenciales de bases de datos.
- Llaves privadas.
- Información sensible.

No copiar el contenido de archivos .env reales
hacia la documentación.

## 7. Documentación del código

El código deberá ser comprensible mediante nombres
descriptivos y una estructura clara.

Agregar comentarios cuando sea necesario explicar:

- Decisiones técnicas no evidentes.
- Algoritmos complejos.
- Restricciones importantes.
- Comportamientos inesperados.
- Contratos de funciones o interfaces.
- Limitaciones justificadas.
- Reglas de negocio relevantes.

Evitar:

- Comentarios que repitan lo evidente.
- Comentarios excesivos.
- Documentación de código inexistente.
- Comentarios desactualizados.
- Explicaciones que contradigan la implementación.

Actualizar o eliminar comentarios que hayan quedado
obsoletos como consecuencia de los cambios.

Respetar las convenciones de documentación del lenguaje
y framework utilizados por el proyecto.

## 8. Documentación de interfaces

Cuando se introduzcan o modifiquen interfaces públicas,
documentar según corresponda:

- Propósito.
- Parámetros y entradas.
- Resultados y salidas.
- Restricciones.
- Errores posibles.
- Requisitos de autenticación.
- Ejemplos de utilización.

Para APIs, documentar adicionalmente cuando corresponda:

- Métodos y rutas.
- Formato de solicitudes.
- Formato de respuestas.
- Códigos de estado.
- Requisitos de autorización.

Utilizar las herramientas de documentación existentes.

No incorporar herramientas o frameworks adicionales
sin autorización humana.

## 9. Documentación de testing

Mantener actualizadas las instrucciones necesarias
para ejecutar las pruebas del proyecto.

Documentar cuando corresponda:

- Comandos de testing.
- Requisitos del entorno de pruebas.
- Configuraciones necesarias.
- Servicios y dependencias de prueba.
- Preparación de datos de prueba.
- Diferencias entre pruebas unitarias y de integración.
- Restricciones de ejecución.

Cargar la Skill testing cuando sea necesario verificar
los procedimientos o configuraciones correspondientes.

No documentar resultados de pruebas como garantías
permanentes del funcionamiento del producto.

## 10. Colaboración y control de cambios

Varios integrantes podrán modificar la documentación
simultáneamente.

Por lo tanto:

- Inspeccionar el contenido actual antes de editarlo.
- Modificar únicamente las secciones afectadas.
- Preservar la información vigente.
- Respetar las contribuciones de otros integrantes.
- Evitar reorganizaciones innecesarias.
- Evitar cambios masivos de formato.
- No eliminar información relevante sin justificación.

Cada rama deberá documentar el estado de la versión
del producto a la que pertenece.

No documentar funcionalidades de otros releases
como si estuvieran disponibles en la rama actual.

Cuando existan conflictos de documentación:

- Identificar las modificaciones de ambas partes.
- Preservar la información válida y compatible.
- Eliminar duplicaciones resultantes de la integración.
- Verificar la documentación contra el código actual.
- Consultar al usuario si existen contradicciones ambiguas.

Cargar git-workflow cuando sea necesario gestionar
conflictos o sincronización de ramas.

## 11. Principios de redacción

La documentación deberá ser:

- Clara.
- Concisa.
- Precisa.
- Consistente.
- Fácil de consultar.
- Orientada al uso práctico.

Utilizar Markdown correctamente.

Respetar el idioma y las convenciones de la documentación
existente.

Utilizar encabezados descriptivos, tablas cuando aporten
claridad y bloques de código para comandos y ejemplos.

No convertir README.md en un historial de commits,
un reporte de actividades o un manual innecesariamente extenso.

No generar documentos adicionales si README.md
es suficiente para comunicar la información.

## 12. Validación y entrega

Antes de finalizar:

- Verificar que la documentación coincida con el código.
- Revisar los comandos y ejemplos modificados.
- Comprobar rutas y enlaces relevantes.
- Verificar la consistencia de las variables de entorno.
- Confirmar que no existan secretos expuestos.
- Inspeccionar las diferencias generadas.
- Confirmar que se preservó la información vigente.

Comunicar brevemente uno de los siguientes resultados:

- README actualizado: indicar las secciones modificadas.
- README revisado sin cambios: indicar que continúa vigente.
- Documentación pendiente de validación: indicar la limitación.

Incluir los cambios de documentación relacionados
con una funcionalidad en su mismo Pull Request.

Para cambios exclusivamente documentales, utilizar
Conventional Commits de tipo docs.

Ejemplos:

    docs(readme): actualizar instrucciones de instalación
    docs(api): documentar endpoint de autenticación
    docs(config): documentar variables de entorno
    docs(testing): actualizar comandos de pruebas

La documentación deberá evolucionar junto con el código,
no después de que termine el desarrollo.
