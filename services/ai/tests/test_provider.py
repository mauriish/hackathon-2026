import json
import unittest
from unittest.mock import patch

from services.ai.provider import (
    GeminiConfig,
    GeminiProvider,
    ProviderError,
    StructuredProvider,
)


class ExampleResponse:
    @classmethod
    def model_json_schema(cls):
        return {
            "type": "object",
            "properties": {"status": {"type": "string"}},
            "required": ["status"],
        }

    @classmethod
    def model_validate_json(cls, value):
        result = json.loads(value)
        if set(result) != {"status"} or not isinstance(result["status"], str):
            raise ValueError("invalid model")
        return cls(result["status"])

    def __init__(self, status):
        self.status = status


class FakeHttpResponse:
    def __init__(self, body):
        self._body = body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return self._body


class GeminiProviderTests(unittest.TestCase):
    def setUp(self):
        self.provider = GeminiProvider(
            GeminiConfig(api_key="test-secret", model="test-model")
        )

    @patch("services.ai.provider.urlopen")
    def test_generates_and_validates_structured_response(self, urlopen_mock):
        urlopen_mock.return_value = FakeHttpResponse(
            json.dumps(
                {"candidates": [{"content": {"parts": [{"text": '{"status":"ok"}'}]}}]}
            ).encode()
        )

        result = self.provider.generate("Clasifica este texto", ExampleResponse)

        self.assertIsInstance(result, ExampleResponse)
        self.assertEqual(result.status, "ok")
        request = urlopen_mock.call_args.args[0]
        body = json.loads(request.data)
        self.assertEqual(body["generationConfig"]["responseMimeType"], "application/json")
        self.assertEqual(
            body["generationConfig"]["responseJsonSchema"],
            ExampleResponse.model_json_schema(),
        )
        self.assertNotIn("test-secret", request.full_url)
        self.assertEqual(request.get_header("X-goog-api-key"), "test-secret")
        self.assertNotIn("test-secret", request.data.decode("utf-8"))
        self.assertIsInstance(self.provider, StructuredProvider)

    def test_loads_configuration_from_environment(self):
        with patch.dict(
            "os.environ",
            {"GEMINI_API_KEY": "configured-secret", "GEMINI_MODEL": "configured-model"},
        ):
            config = GeminiConfig.from_environment()

        self.assertEqual(config.api_key, "configured-secret")
        self.assertEqual(config.model, "configured-model")

    def test_rejects_missing_configuration_without_exposing_secret(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaisesRegex(ValueError, "GEMINI_API_KEY"):
                GeminiConfig.from_environment()

    @patch("services.ai.provider.urlopen")
    def test_rejects_malformed_structured_response(self, urlopen_mock):
        urlopen_mock.return_value = FakeHttpResponse(
            json.dumps(
                {"candidates": [{"content": {"parts": [{"text": '{"status":42}'}]}}]}
            ).encode()
        )

        with self.assertRaisesRegex(ProviderError, "respuesta estructurada inválida"):
            self.provider.generate("Clasifica este texto", ExampleResponse)

    @patch("services.ai.provider.urlopen")
    def test_rejects_invalid_json_response(self, urlopen_mock):
        urlopen_mock.return_value = FakeHttpResponse(
            json.dumps(
                {"candidates": [{"content": {"parts": [{"text": "{not-json"}]}}]}
            ).encode()
        )

        with self.assertRaisesRegex(ProviderError, "respuesta estructurada inválida"):
            self.provider.generate("Clasifica este texto", ExampleResponse)

    @patch("services.ai.provider.urlopen")
    def test_does_not_expose_api_key_on_transport_error(self, urlopen_mock):
        urlopen_mock.side_effect = OSError("request failed with test-secret")

        with self.assertRaises(ProviderError) as context:
            self.provider.generate("Clasifica este texto", ExampleResponse)

        self.assertNotIn("test-secret", str(context.exception))

    def test_rejects_empty_prompt_without_request(self):
        with patch("services.ai.provider.urlopen") as urlopen_mock:
            with self.assertRaises(ValueError):
                self.provider.generate(" ", ExampleResponse)
        urlopen_mock.assert_not_called()


if __name__ == "__main__":
    unittest.main()
