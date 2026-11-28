# Contratos entre módulos

Los contratos compartidos son propiedad de `mauriish`. Los cambios de interfaz
se proponen mediante PR por el propietario del módulo consumidor o productor,
y requieren revisión de `mauriish` y de los propietarios afectados.

## Reglas de comunicación

- Las interfaces HTTP entre consumidores y backend utilizan REST con JSON.
  OpenAPI documenta las API y Pydantic valida los modelos del backend.
- Los módulos acuerdan y documentan aquí sus interfaces antes de integrarlas;
  estos estándares no autorizan acoplamiento a implementaciones internas ni
  fijan por sí solos los esquemas concretos de cada operación.
- `services/api/` y `services/ai/` intercambian capacidades mediante interfaces
  explícitas, sin acoplarse a implementaciones internas.
- `packages/security/` publica capacidades reutilizables; los módulos consumen
  sus interfaces sin editar sus archivos internos.
- **Pruebas:** `tests/` verifica comportamiento usando los contratos públicos,
  no detalles internos de cada módulo.

## Catálogo de contratos

Definir los esquemas concretos con productores y consumidores para:

- Análisis de mensajes y sus ratings comunitario, de IA e identidad digital.
- Ponderación dinámica y búsqueda de organizaciones/dominios similares.
- Extracción estructurada de reportes, validación y almacenamiento.
- Recuperación de conocimiento validado.

Cada propuesta deberá acordar propósito, entradas, salidas, errores,
compatibilidad y ejemplos anonimizados con los propietarios afectados. No
incorporar decisiones de implementación hasta su acuerdo.
