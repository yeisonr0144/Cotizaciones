import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from services.excel_service import process_excel
from services.pdf_service import generate_pdf

router = APIRouter(tags=["Files"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.post("/generate-quote")
async def generate_quote(file: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        cotizacion = process_excel(file_location)
        return {"success": True, "cotizacion": cotizacion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-pdf")
async def generate_pdf_endpoint(payload: dict):
    try:
        procedimiento = payload.get("procedimiento", {})
        materiales = payload.get("materiales", [])
        mano_de_obra = payload.get("manoDeObra", [])
        totales = payload.get("totales", {})

        pdf_path = generate_pdf(procedimiento, materiales, mano_de_obra, totales)
        filename = os.path.basename(pdf_path)
        return {"success": True, "filename": filename, "pdfPath": pdf_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download-pdf/{filename}")
async def download_pdf(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    return FileResponse(path=file_path, filename=filename, media_type='application/pdf')