from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path
from processor import process_document

app = FastAPI()

# Permite que el frontend (HTML local) se comunique con este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process")
async def process_pdf(
    file: UploadFile = File(...),
    provider: str = Form(...),
    api_key: str = Form(...),
    output_type: str = Form(...),
    language: str = Form("es"),
    enable_web_search: bool = Form(False)
):
    temp_path = Path(f"temp_{file.filename}")
    try:
        # Guarda el PDF subido temporalmente
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Llama a tu procesador pasando la API Key del frontend
        result = process_document(
            provider=provider,
            pdf_path=temp_path,
            output_type=output_type,
            api_key=api_key,
            language=language,
            enable_web_search=enable_web_search
        )
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Limpia el archivo temporal
        if temp_path.exists():
            temp_path.unlink()