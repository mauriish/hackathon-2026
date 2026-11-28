# Reportes

La ruta `/report` muestra una vista previa del reporte con:

- Tipo de escenario.
- Resultado de la evaluación.
- Origen del análisis.
- Estado pendiente de envío.
- Acceso al asistente **Reportar este caso**.

La ruta `/report/nuevo` implementa el asistente de reporte de usuario en tres
pasos:

1. **Cuéntanos qué pasó**: cuadro de texto grande para el mensaje recibido y
   botón de audio grande deshabilitado con «Grabar audio (próximamente)».
2. **Destino y evidencia**: enlace o aplicación obligatorio, contexto opcional
   y captura opcional. Si no se tiene captura, se puede continuar igual.
3. **Revisa y confirma**: datos extraídos de forma simulada y editables
   (mensaje, destino, contexto y contacto opcional), confirmación explícita y
   comprobación sencilla antes de enviar. **Restablecer datos originales**
   cancela los cambios.

La comprobación es un único botón grande («Soy una persona»), sin imágenes,
rompecabezas ni tiempo límite. Muestra «Verificando, espera un momento…»,
«Listo, podemos continuar» y, si fallara, un mensaje comprensible con opción de
reintento. Si se corrige algún dato, se vuelven a pedir la confirmación y la
comprobación.

Los botones inferiores indican el siguiente paso de forma explícita («Continuar
al paso 2», «Continuar al paso 3» y «Enviar reporte») y el botón **Volver
atrás** conserva lo escrito. El indicador muestra «Paso 1 de 3», «Paso 2 de 3»
o «Paso 3 de 3». La confirmación final es una pantalla verde con palomita
grande, el mensaje «¡Listo! Ya recibimos tu reporte. Ya puedes cerrar esta
ventana» y un aviso claro de demostración.

## Modo demostración

El registro real requiere la API de reportes y todavía no está implementado.
El asistente:

- Genera los «datos extraídos» en local a partir del borrador, sin llamar a la
  IA ni a la API.
- Construye en memoria un contrato `ReportSubmission` con un token ficticio,
  usando los datos ya corregidos y confirmados.
- No realiza peticiones de red ni persiste datos.
- No envía ni guarda las capturas o el audio; solo muestra una vista previa
  local.
- El contacto es opcional y solo se incorpora al contexto transitorio del
  contrato en memoria; no se persiste ni se envía a un servidor.

La comprobación visible es simulada y no reemplaza a Cloudflare Turnstile. El
envío real necesitará la API de reportes y la verificación anti-abuso del
backend; el widget se podrá sustituir internamente sin cambiar el flujo.

## Pruebas de usabilidad (H26-40)

`usabilidad/guion-prueba.md` describe las tareas guiadas y las reglas de registro
sin datos personales. `usabilidad/informe.md` concentra los resultados; las
sesiones con participantes están pendientes y no se han rellenado observaciones
ficticias.
