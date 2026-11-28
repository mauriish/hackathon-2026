# Identidad digital

Área para verificar señales de identidad digital. Esta versión aporta una
interfaz mínima y pura para extraer, normalizar y comparar URLs con un catálogo
inyectado, sin acceder a enlaces sospechosos.

## API pública

Importable desde `packages.security.identity`:

- `extract_first_url(text)`: devuelve el primer candidato `http(s)` de un texto
  o `None`. No valida ni visita el enlace.
- `normalize_url(value)`: devuelve la forma canónica o `None` si la entrada es
  inválida. Conserva esquema, host, puerto no predeterminado y ruta; elimina
  consulta y fragmento.
- `classify_url(value, catalog)`: devuelve `UrlClassification` con `status`
  (`KNOWN`, `UNKNOWN` o `INVALID`), `normalized_url` y `host`.

`catalog` es una colección de hosts normalizados (o URLs, de las que se toma el
host). La comparación es exacta sobre el host: `www.example.org` y
`example.org` son entradas distintas salvo que el catálogo incluya ambas. No se
aplica una Public Suffix List ni se infiere un dominio registrable.

## Garantía de no navegación

La interfaz usa únicamente biblioteca estándar (`urllib.parse`, `ipaddress`,
`re`). No crea conexiones, no resuelve DNS, no descarga listas de sufijos ni
consulta servicios externos. La validación es determinista y no depende del
estado de la red.

## Ejemplo sintético

```python
from packages.security.identity import UrlStatus, classify_url

catalog = {"example.org", "organizacion.invalid"}
resultado = classify_url("https://www.Ejemplo.invalid:443/ruta?x=1", catalog)
assert resultado.status is UrlStatus.UNKNOWN
assert resultado.normalized_url == "https://www.ejemplo.invalid/ruta"
```

Los dominios del ejemplo son ficticios o reservados; no se visitan.

## Criterios y fuentes de evidencia

Los criterios generales de identidad digital y las fuentes de evidencia
siguen pendientes de acuerdo y no se definen aquí. Un contrato compartido
deberá acordarse con `mauriish` antes de integrar esta capacidad con otros
módulos.
