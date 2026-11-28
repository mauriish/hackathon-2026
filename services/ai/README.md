# Servicio de IA

Propietario: @Chedooo (AI Engineer). Aquí se organizarán el análisis semántico
de mensajes, extracción estructurada de reportes y recuperación de conocimiento
validado.

Mantén las pruebas unitarias y documentación específica aquí. Propón interfaces
en `contracts/` mediante PR con revisión de los propietarios afectados. No
modifiques API, frontend ni configuración compartida sin autorización. El stack
y los contratos definitivos aún no están acordados.

## Proveedor de respuestas estructuradas

`provider.py` contiene un adaptador interno para Gemini. Recibe el prompt y un
modelo compatible con la validación JSON de Pydantic; envía su JSON Schema al
proveedor y devuelve únicamente una instancia validada. No define contratos de
negocio compartidos ni se acopla a implementaciones de otros módulos.

Configura `GEMINI_API_KEY` y `GEMINI_MODEL` en el entorno antes de crear
`GeminiConfig` con `GeminiConfig.from_environment()`. La clave nunca se incluye
en errores del adaptador. Para las pruebas, se puede sustituir la llamada HTTP
por un mock sin utilizar credenciales ni realizar solicitudes externas.
