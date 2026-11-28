# Extracción

`report.py` expone `ReportExtractor`, que solicita los campos `entity`,
`observed_url`, `date`, `channel`, `type` y `summary` mediante el
`StructuredProvider` del módulo. Cada campo desconocido o ambiguo se devuelve
como `None`. Los valores inferidos se identifican en `inferred_fields`.

El resultado `ReportExtraction` es mutable para que el consumidor pueda
presentar sus valores para revisión y edición del usuario. Esta es una interfaz
interna del módulo; no sustituye un contrato compartido acordado en
`contracts/`.

```python
from services.ai.extraction.report import ReportExtractor
from services.ai.provider import GeminiConfig, GeminiProvider

extractor = ReportExtractor(GeminiProvider(GeminiConfig.from_environment()))
result = extractor.extract("Reporte recibido por SMS con URL https://example.test")
result.entity = "Entidad corregida por el usuario"
```

Las pruebas usan un proveedor falso; no requieren credenciales ni llamadas
externas.
