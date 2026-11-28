# Reputación

Consultas a fuentes externas autorizadas. Esta versión implementa Google Safe
Browsing como proveedor acordado para H26-37; no navega los enlaces recibidos y
no envía el mensaje original, datos personales, direcciones IP ni credenciales.

## API pública

Importable desde `packages.security.reputation`:

- `check_url(url, *, api_key=None, timeout=5.0, opener=None)`: realiza la
  consulta y devuelve `ReputationResult`.
- `SafeBrowsingClient`: cliente reutilizable con el mismo contrato.

La clave se lee de `GOOGLE_SAFE_BROWSING_API_KEY` cuando no se pasa `api_key`.
La variable es opcional en el sentido de que su ausencia no produce una
excepción: el resultado marca el proveedor como no disponible. El valor debe
configurarse en cada entorno; no se guarda en el repositorio.

`ReputationResult` expone:

- `status`: `THREAT`, `NO_THREAT` o `UNAVAILABLE`.
- `available`: `False` cuando el proveedor no respondió; permite al consumidor
  continuar con el resto de `Check` sin bloquearlo.
- `normalized_url`: URL canónica consultada, sin consulta ni fragmento.
- `evidence`: tupla de `Evidence` del contrato v1, con `source`
  `google_safe_browsing` y un `evidence_id` derivado de un hash de la URL
  normalizada. No incluye la URL en texto libre.
- `provider_status`: `ProviderStatus` del contrato v1 (`available` o
  `unavailable` con un `ApiError` de `provider_unavailable`,
  `provider_invalid_response` o `invalid_report`).

La salida se puede pasar directamente al productor de `Check`: la evidencia se
agrega a `Check.evidence` y el estado a `Check.providers`. No se añade un
`signals.reputation` porque eso exigiría modificar `contracts/`, propiedad de
otra área.

## Privacidad y disponibilidad

- La URL se normaliza con `packages.security.identity.normalize_url` antes de
  enviarse; se descartan consulta y fragmento, que podrían contener datos
  personales o tokens.
- El cuerpo de la petición contiene únicamente la URL normalizada y metadatos
  fijos del cliente. El destino **no se visita**: solo se consulta la API de
  Google Safe Browsing.
- Timeout, errores de red, respuestas HTTP de error, JSON inválido y falta de
  configuración se convierten en `UNAVAILABLE`. Ninguno lanza hacia el
  consumidor ni modifica el resultado de las demás señales.
- El `opener` se puede inyectar para pruebas; no se realizan llamadas reales
  durante la ejecución de la suite unitaria.

## Ejemplo sintético

```python
from packages.security.reputation import check_url

resultado = check_url(
    "https://ejemplo.invalid/verificar?token=privado",
    api_key="valor-de-prueba",
)

if resultado.available:
    print(resultado.status.value, resultado.provider_status["status"])
else:
    print("Fuente no disponible; Check continúa sin esta señal")
```

## Pruebas

```bash
python -m pytest packages/security/tests/test_reputation_safe_browsing.py -q
```

Las pruebas cubren éxito, ausencia, timeout, respuesta inválida, clave ausente,
URL inválida, códigos HTTP y no divulgación de datos sensibles.

## Limitaciones

- H26-12 (endpoint de análisis) no está implementado en `release/v4`, por lo que
  la integración end-to-end con `Check` queda pendiente.
- La configuración de la clave en `.env.example` y en el despliegue requiere la
  revisión de la configuración compartida; este cambio no la modifica.
- La suite de `packages/security/tests` no la ejecuta actualmente GitHub
  Actions, según `packages/security/tests/README.md`.
