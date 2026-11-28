# Evaluación

Dataset sintético etiquetado para preparar la evaluación de H26-33. No mide
efectividad ni latencias: esas mediciones corresponden a H26-35 y requerirán
implementaciones reales.

## Estructura

- `datasets/evaluation-cases.json`: 12 casos con `id`, `category`, `contract`,
  `scenario`, `payload` y `expected`.
- `schemas/evaluation-dataset.schema.json`: estructura local del dataset. No es
  un contrato compartido entre módulos.
- `test_evaluation_dataset.py`: validaciones del dataset.

Las cuatro categorías son `benigno`, `sospechoso`, `ambiguo` y `error`, con tres
casos cada una. Cada caso declara el resultado esperado: validez contra el
contrato, tipo de contrato, estado, nivel de riesgo, puntaje, señales
disponibles o código de error, según corresponda.

## Contratos y datos sintéticos

Los `payload` se validan contra
`contracts/schemas/v1/contracts.schema.json` (H26-03), propiedad de
`mauriish` y consumido aquí en modo lectura. No se modifica `contracts/`.

Todos los destinos usan dominios reservados `.invalid`; los identificadores,
fechas y tokens son fijos y ficticios. No hay datos personales reales,
credenciales, IPs ni números de teléfono. `cases_digest_sha256` detecta cambios
no intencionados en los casos.

## Ejecución

Con Python 3.12 y las dependencias ya declaradas en
`contracts/requirements-test.txt`:

```bash
python -m pip install -r contracts/requirements-test.txt
python -m pytest tests/evaluation -q
```

## Reglas comprobadas

- Cobertura de las cuatro categorías e identificadores únicos.
- Conformidad de cada caso con su esquema local y con el contrato H26-03.
- Coherencia de la ponderación: pesos disponibles suman 1, señales no
  disponibles con puntaje nulo y peso cero, sin doble conteo.
- Resultado `no_concluyente` cuando no hay señales o Gemini no está disponible.
- Límites de nivel de riesgo y expiración de 14 días del seudónimo antiabuso.
- Ausencia de correos, teléfonos y dominios no reservados.

## Limitaciones

El workflow actual solo ejecuta las pruebas generales de `tests/security`; no
ejecuta esta carpeta. No se modificó `.github/` por requerir autorización. La
integración con implementaciones reales se validará cuando esos módulos estén
disponibles en esta versión.
