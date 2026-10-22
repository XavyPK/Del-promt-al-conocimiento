import json
import os
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from processor import process_document, PromptFactory, extract_pdf_text


class TestPDFProcessor(unittest.TestCase):
    
    def setUp(self):
        os.environ["GEMINI_API_KEY"] = "test_key"
        os.environ["GROQ_API_KEY"] = "test_key"
        self.dummy_pdf = Path("dummy.pdf")
        self.dummy_pdf.touch()

    def tearDown(self):
        if self.dummy_pdf.exists():
            self.dummy_pdf.unlink()

    def test_prompt_factory(self):
        prompt = PromptFactory.build("summary", "es")
        self.assertIn("summary", prompt.lower())
        self.assertIn("es", prompt)
        
        with self.assertRaises(ValueError):
            PromptFactory.build("invalid_type", "es")

    @patch("processor.extract_pdf_text")
    @patch("processor.Groq")
    def test_groq_success(self, MockGroq, mock_extract):
        mock_extract.return_value = "Texto del PDF simulado."
        
        # Mocking Groq API response
        mock_instance = MockGroq.return_value
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps({"summary": "Prueba exitosa"})
        mock_instance.chat.completions.create.return_value.choices = [mock_choice]

        result = process_document("groq", self.dummy_pdf, "summary")
        self.assertEqual(result.get("summary"), "Prueba exitosa")

    @patch("processor.genai.Client")
    def test_gemini_success_with_web_search(self, MockClient):
        # Mocking Gemini SDK calls
        mock_instance = MockClient.return_value
        
        mock_file = MagicMock()
        mock_file.name = "test_file"
        mock_file.state = "ACTIVE"
        mock_instance.files.upload.return_value = mock_file
        
        mock_response = MagicMock()
        mock_response.text = json.dumps({"slides": [{"title": "Test"}]})
        mock_instance.models.generate_content.return_value = mock_response

        result = process_document(
            provider="gemini", 
            pdf_path=self.dummy_pdf, 
            output_type="presentation",
            enable_web_search=True
        )
        
        self.assertEqual(result["slides"][0]["title"], "Test")
        # Verificar que se llamó con tools si enable_web_search=True
        call_args = mock_instance.models.generate_content.call_args[1]
        self.assertTrue(hasattr(call_args["config"], "tools"))

    @patch("processor.extract_pdf_text")
    @patch("processor.Groq")
    def test_invalid_json_handling(self, MockGroq, mock_extract):
        mock_extract.return_value = "Texto"
        
        mock_instance = MockGroq.return_value
        mock_choice = MagicMock()
        mock_choice.message.content = "Not a JSON"
        mock_instance.chat.completions.create.return_value.choices = [mock_choice]

        with self.assertRaises(RuntimeError) as context:
            process_document("groq", self.dummy_pdf, "questions")
        
        self.assertIn("La respuesta no es un JSON válido", str(context.exception))


if __name__ == "__main__":
    unittest.main()
    