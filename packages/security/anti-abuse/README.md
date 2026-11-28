# Protección contra abuso

Controles reutilizables para limitar la frecuencia y verificar Turnstile.
El directorio usa guion en su nombre; para importarlo desde Python se emplea
`importlib`:

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

## Política

- Clave: identidad opaca más endpoint (`identity`, `endpoint`).
- Ventana: 60 segundos por defecto, configurable en el constructor.
- Límite: 20 solicitudes por ventana, configurable en el constructor.
- Al superarse el límite: decisión denegada con `status_code=429`,
  `code="rate_limited"`, `retryable=True` y segundos de reintento.
- No se solicita ni verifica un CAPTCHA nuevo al superar el límite.
- Turnstile se verifica solo donde el contrato ya lo exige; un token ausente,
  inválido o cuya consulta falle impide la aceptación.

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
- No emite respuestas HTTP ni consume el proveedor Turnstile real.
- Los adaptadores de transporte deben traducir sus errores a
  `TurnstileUnavailableError`; otras excepciones no se silencian.
