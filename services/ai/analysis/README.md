# Análisis semántico

`social_engineering.py` implementa un analizador de mensajes mediante el
`StructuredProvider` de `services/ai/provider.py`. Devuelve señales posibles
con explicación y una cita literal acompañada de offsets `[start, end)` en el
mensaje. La lista vacía representa que no se encontraron señales; el resultado
no es una determinación de fraude ni una afirmación de certeza.

Uso:

```python
from services.ai.analysis.social_engineering import SocialEngineeringAnalyzer
from services.ai.provider import GeminiConfig, GeminiProvider

analyzer = SocialEngineeringAnalyzer(
    GeminiProvider(GeminiConfig.from_environment())
)
result = analyzer.analyze("Mensaje a evaluar")
```

Las pruebas usan un proveedor falso y no requieren credenciales ni llamadas
externas. El modelo `SocialEngineeringAnalysis` es interno al módulo; no
sustituye un contrato compartido acordado en `contracts/`.

Ante un timeout, una respuesta inválida o una cita que no pueda verificarse,
`SocialEngineeringAnalyzer.analyze` lanza `AnalysisError` con un mensaje
controlado. No se interpreta el fallo como ausencia de señales. El rating
semántico, en cambio, devuelve `AiAssessment` no concluyente y de confianza baja
ante errores del proveedor o evidencia no verificable. Los mensajes y contextos
se serializan como JSON y se instruye al modelo a tratarlos como datos; esto no
sustituye otras medidas de seguridad ni el saneamiento que corresponde al
llamador.

## Rating semántico

`semantic_rating.py` implementa `SemanticRater` y devuelve un `AiAssessment`
validado contra el esquema compartido `contracts/schemas/v1/contracts.schema.json`.
`risk_score` expresa riesgo de 0 a 100; `confidence` expresa por separado la
fiabilidad de la evaluación. Cuando no hay evidencia suficiente, el resultado
usa `risk_score: null`, `risk_level: "no_concluyente"` y confianza baja. Las
citas de evidencia deben aparecer literalmente en el mensaje.

```python
from services.ai.analysis.semantic_rating import SemanticRater
from services.ai.provider import GeminiConfig, GeminiProvider

rater = SemanticRater(GeminiProvider(GeminiConfig.from_environment()))
assessment = rater.assess("Mensaje saneado", context="Contexto saneado")
```

El llamador debe sanear mensaje y contexto antes de invocar al proveedor.
Las pruebas usan un proveedor falso y no hacen solicitudes externas.
