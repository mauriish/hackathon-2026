# Rutas

`POST /reports` recibe `ReportSubmission` conforme al esquema publicado en
`contracts/`. Valida la entrada, aplica Turnstile y controles antiabuso por sus
interfaces públicas, y persiste únicamente el contenido saneado con estado
`received`. La respuesta es `202 Accepted` sin contenido; no expone el reporte
ni lo hace público. Errores seguros siguen el contrato `ApiError`.
