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
externas. El modelo de respuesta es interno al módulo y no sustituye un contrato
compartido acordado en `contracts/`.
