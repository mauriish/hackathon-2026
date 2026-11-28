"""Adaptador interno para generar respuestas estructuradas con Gemini."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Protocol, TypeVar, runtime_checkable
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


class StructuredModel(Protocol):
    """Interfaz compatible con los modelos Pydantic usados para validar salida."""

    @classmethod
    def model_json_schema(cls) -> dict[str, Any]: ...

    @classmethod
    def model_validate_json(cls, value: str) -> Any: ...


T = TypeVar("T", bound=StructuredModel)


@runtime_checkable
class StructuredProvider(Protocol):
    """Interfaz sustituible para proveedores de respuestas estructuradas."""

    def generate(self, prompt: str, response_model: type[T]) -> T: ...


class ProviderError(Exception):
    """Error seguro del adaptador; no incluye credenciales ni respuesta remota."""


@dataclass(frozen=True)
class GeminiConfig:
    api_key: str
    model: str
    timeout_seconds: float = 30.0

    @classmethod
    def from_environment(cls) -> GeminiConfig:
        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        model = os.environ.get("GEMINI_MODEL", "").strip()
        if not api_key:
            raise ValueError("La variable GEMINI_API_KEY es obligatoria.")
        if not model:
            raise ValueError("La variable GEMINI_MODEL es obligatoria.")
        return cls(api_key=api_key, model=model)


class GeminiProvider:
    """Proveedor intercambiable que valida la salida con el modelo recibido."""

    def __init__(self, config: GeminiConfig) -> None:
        self._config = config

    def generate(self, prompt: str, response_model: type[T]) -> T:
        if not prompt.strip():
            raise ValueError("El prompt no puede estar vacío.")

        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{quote(self._config.model, safe='')}:generateContent"
        )
        request_body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseJsonSchema": response_model.model_json_schema(),
            },
        }
        request = Request(
            url,
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self._config.api_key,
            },
            method="POST",
        )

        try:
            with urlopen(request, timeout=self._config.timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            UnicodeDecodeError,
            json.JSONDecodeError,
        ):
            # No propagar excepciones de transporte que pueden contener la URL con la clave.
            raise ProviderError("No fue posible obtener una respuesta del proveedor.") from None

        try:
            text = payload["candidates"][0]["content"]["parts"][0]["text"]
            if not isinstance(text, str):
                raise TypeError
            return response_model.model_validate_json(text)
        except (KeyError, IndexError, TypeError, ValueError):
            raise ProviderError("El proveedor devolvió una respuesta estructurada inválida.") from None
        except Exception:
            # Incluye errores de validación del modelo sin exponer entrada ni datos remotos.
            raise ProviderError("El proveedor devolvió una respuesta estructurada inválida.") from None
