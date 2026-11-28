# Protección contra abuso

Controles reutilizables para limitar la frecuencia, verificar Turnstile y
deduplicar reportes saneados. El directorio usa guion en su nombre; para
importarlo desde Python se emplea `importlib`:

```python
import importlib

anti_abuse = importlib.import_module("packages.security.anti-abuse")
```

## Componentes

- `RateLimiter`: ventana deslizante en memoria con límite configurable.
  Valores por defecto: 20 solicitudes por identidad y endpoint en 60 segundos.
- `TurnstileVerifier`: verificación fail-closed de un token mediante una
  función inyectable. No realiza llamadas de red.
- `evaluate_request`: aplica el límite primero y, si la solicitud pasa,
  verifica Turnstile cuando se proporciona un verificador.
- `Deduplicator`: detecta reportes repetidos mediante `hashlib` y un almacén
  inyectable; el primero se acepta, los duplicados no suman.
- `compute_fingerprint`: huella SHA-256 del contenido saneado canónico.
- `InMemoryFingerprintStore`: almacén en memoria; puede sustituirse por otro
  que implemente `FingerprintStore`.

## Política

- Clave: identidad opaca más endpoint (`identity`, `endpoint`).
- Ventana: 60 segundos por defecto, configurable en el constructor.
- Límite: 20 solicitudes por ventana, configurable en el constructor.
- Al superarse el límite: decisión denegada con `status_code=429`,
  `code="rate_limited"`, `retryable=True` y segundos de reintento.
- No se solicita ni verifica un CAPTCHA nuevo al superar el límite.
- Turnstile se verifica solo donde el contrato ya lo exige; un token ausente,
  inválido o cuya consulta falle impide la aceptación.
- La deduplicación normaliza espacios, composición Unicode y mayúsculas antes
  de calcular la huella; las variaciones de formato no crean reportes nuevos.
- Un duplicado se marca `duplicate=True`, `accepted=False` y no se registra de
  nuevo: no suma al conteo ni al conocimiento validado.
- Toda decisión de deduplicación nace con `status="pending"`,
  `requires_independent_validation=True` y `publication_allowed=False`.

```python
decision = anti_abuse.Deduplicator().evaluate(
    target_kind="link",
    target_value="ejemplo.mx/estafa",
    sanitized_message="Piden pago anticipado",
    sanitized_context="Difundido en redes sociales",
)
```

La huella solo se calcula con destino, mensaje y contexto saneados. La IP, el
`abuse_id`, el token de Turnstile, las credenciales y el texto original no son
entradas del componente, por lo que no aparecen en la decisión ni en el
almacén: los datos sensibles quedan fuera del conocimiento.

La IP cruda no es una entrada de este módulo. El llamador debe pasar una
identidad opaca: hoy puede derivarla sin persistirla; cuando existan la
autenticación (H26-38) y el identificador HMAC de 14 días (H26-09/H26-03),
debe pasar ese seudónimo o un identificador de usuario para no penalizar a
quienes comparten IP. Los resultados no incluyen la IP ni el token.

La exclusión de `/health` del límite y la traducción de la decisión a una
respuesta HTTP son responsabilidad del API. Este paquete solo publica la
decisión estructurada.

## Pruebas

```bash
python -m pytest packages/security/tests -q
```

## Limitaciones

- El estado se mantiene en memoria; se reinicia al reiniciar el proceso.
- La deduplicación no se conecta a la base de datos ni habilita la publicación:
  la validación independiente y las transiciones de estado corresponden a los
  módulos responsables.
- No emite respuestas HTTP ni consume el proveedor Turnstile real.
- Los adaptadores de transporte deben traducir sus errores a
  `TurnstileUnavailableError`; otras excepciones no se silencian.
