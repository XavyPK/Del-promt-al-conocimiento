from __future__ import annotations

import json
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from pathlib import Path
from typing import Any, Literal

from google import genai
from google.genai import types
from groq import Groq
from pypdf import PdfReader

# Modelos recomendados para JSON estricto
GEMINI_MODEL = "gemini-3.6-flash"
GROQ_MODEL = "openai/gpt-oss-20b"

MAX_GEMINI_ATTEMPTS = 3
BASE_WAIT_SECONDS = 5

GEMINI_TIMEOUT_SECONDS = 90
GROQ_TIMEOUT_SECONDS = 60

OutputType = Literal["questions", "summary", "presentation", "mind_map"]


class PromptFactory:
    """Fábrica de prompts dinámicos según el tipo de salida requerido."""
    
    @staticmethod
    def build(output_type: OutputType, language: str, **kwargs) -> str:
        base_instructions = f"Analyze this document and generate content strictly in {language}. YOU MUST RETURN ONLY A VALID JSON OBJECT."
        
        schemas = {
            "questions": """
            Generate an academic question bank. Include explanations.
            Format:
            {
              "questions": [
                {
                  "type": "multiple_choice",
                  "question": "Text",
                  "options": ["A", "B", "C", "D"],
                  "correct_answer": "A",
                  "explanation": "Why A is correct"
                },
                {
                  "type": "true_false",
                  "question": "Statement",
                  "options": ["True", "False"],
                  "correct_answer": "True",
                  "explanation": "Why it is true"
                }
              ]
            }""",
            
            "summary": """
            Generate a comprehensive summary, key concepts, and conclusions.
            Format:
            {
              "summary": "Full summary text",
              "key_concepts": ["Concept 1", "Concept 2"],
              "conclusions": ["Conclusion 1", "Conclusion 2"]
            }""",
            
            "presentation": """
            Generate a slide deck structure.
            Format:
            {
              "slides": [
                {
                  "slide_number": 1,
                  "title": "Slide Title",
                  "bullet_points": ["Point 1", "Point 2"],
                  "speaker_notes": "Notes for the presenter"
                }
              ]
            }""",
            
            "mind_map": """
            Generate a hierarchical mind map.
            Format:
            {
              "mind_map": {
                "root_node": "Main Topic",
                "branches": [
                  {
                    "node": "Subtopic 1",
                    "sub_nodes": ["Detail A", "Detail B"]
                  }
                ]
              }
            }"""
        }

        if output_type not in schemas:
            raise ValueError(f"Tipo de salida no soportado: {output_type}")

        return f"{base_instructions}\n\nREQUIREMENTS:\n{schemas[output_type]}"


def _run_with_timeout(func, timeout_seconds: int, *args, **kwargs):
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(func, *args, **kwargs)
        try:
            return future.result(timeout=timeout_seconds)
        except FutureTimeoutError:
            raise TimeoutError(f"Tiempo de espera agotado ({timeout_seconds}s).")


def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(parts)


def generate_with_gemini(
    api_key: str,
    pdf_path: Path, 
    prompt: str, 
    enable_web_search: bool = False
) -> tuple[dict[str, Any] | None, str | None]:
    
    if not api_key:
        return None, "La API Key de Gemini no fue proporcionada."

    def _call() -> str:
        client = genai.Client(api_key=api_key)
        pdf_file = client.files.upload(file=str(pdf_path))
        
        try:
            state = getattr(pdf_file.state, "name", pdf_file.state)
            while state == "PROCESSING":
                time.sleep(2)
                pdf_file = client.files.get(name=pdf_file.name)
                state = getattr(pdf_file.state, "name", pdf_file.state)

            if state == "FAILED":
                raise RuntimeError("Gemini no pudo procesar el archivo PDF.")

            config_kwargs: dict[str, Any] = {"response_mime_type": "application/json"}
            if enable_web_search:
                config_kwargs["tools"] = [{"google_search": {}}]
            
            config = types.GenerateContentConfig(**config_kwargs)
            last_exc: Exception | None = None
            
            for attempt in range(1, MAX_GEMINI_ATTEMPTS + 1):
                try:
                    response = client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=[pdf_file, prompt],
                        config=config,
                    )
                    return response.text
                except Exception as e:
                    last_exc = e
                    error_msg = str(e)
                    if "503" in error_msg or "UNAVAILABLE" in error_msg or "429" in error_msg:
                        time.sleep(BASE_WAIT_SECONDS * attempt)
                    else:
                        raise
            raise last_exc or RuntimeError("Gemini agotó sus reintentos.")
        finally:
            try:
                client.files.delete(name=pdf_file.name)
            except Exception:
                pass

    try:
        raw_result = _run_with_timeout(_call, GEMINI_TIMEOUT_SECONDS)
        return json.loads(raw_result), None
    except json.JSONDecodeError:
        return None, "[Gemini] La respuesta no es un JSON válido."
    except Exception as e:
        return None, f"[Gemini] {e}"


def generate_with_groq(
    api_key: str,
    pdf_path: Path, 
    prompt: str, 
    enable_web_search: bool = False
) -> tuple[dict[str, Any] | None, str | None]:
    
    if not api_key:
        return None, "La API Key de Groq no fue proporcionada."

    if enable_web_search:
        print("Warning: Búsqueda web solicitada pero Groq no soporta Grounding en esta implementación. Se procesará solo con el contexto del PDF.")

    def _call() -> str:
        pdf_text = extract_pdf_text(pdf_path)
        groq_client = Groq(api_key=api_key)
        
        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert analytical engine. You must respond STRICTLY in JSON format without markdown wrappers.",
                },
                {"role": "user", "content": f"Document:\n{pdf_text}\n\nInstructions:\n{prompt}"},
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or "{}"

    try:
        raw_result = _run_with_timeout(_call, GROQ_TIMEOUT_SECONDS)
        return json.loads(raw_result), None
    except json.JSONDecodeError:
        return None, "[Groq] La respuesta no es un JSON válido."
    except Exception as e:
        return None, f"[Groq] {e}"


def process_document(
    provider: Literal["gemini", "groq"],
    pdf_path: Path | str,
    output_type: OutputType,
    api_key: str,
    language: str = "es",
    enable_web_search: bool = False,
    **kwargs
) -> dict[str, Any]:
    path_obj = Path(pdf_path)
    if not path_obj.exists():
        raise FileNotFoundError(f"No se encontró el archivo: {pdf_path}")

    prompt = PromptFactory.build(output_type, language, **kwargs)
    
    if provider == "gemini":
        result, error = generate_with_gemini(api_key, path_obj, prompt, enable_web_search)
    elif provider == "groq":
        result, error = generate_with_groq(api_key, path_obj, prompt, enable_web_search)
    else:
        raise ValueError(f"Proveedor no soportado: {provider}")

    if error:
        raise RuntimeError(f"Error procesando documento: {error}")
    
    return result or {}