import os
from pathlib import Path
from processor import process_document

# Asegurar claves (en producción deben venir del entorno del OS)
os.environ["GEMINI_API_KEY"] = "TU_API_KEY"
os.environ["GROQ_API_KEY"] = "TU_API_KEY"

pdf_file = Path("documento_prueba.pdf")

# 1. Preguntas (Groq)
questions = process_document(
    provider="groq",
    pdf_path=pdf_file,
    output_type="questions"
)
print("Questions:", questions)

# 2. Resumen (Gemini sin búsqueda)
summary = process_document(
    provider="gemini",
    pdf_path=pdf_file,
    output_type="summary"
)
print("Summary:", summary)

# 3. Presentación (Gemini CON búsqueda web)
presentation = process_document(
    provider="gemini",
    pdf_path=pdf_file,
    output_type="presentation",
    enable_web_search=True
)
print("Presentation with Grounding:", presentation)

# 4. Mapa Mental (Groq)
mind_map = process_document(
    provider="groq",
    pdf_path=pdf_file,
    output_type="mind_map"
)
print("Mind Map:", mind_map)