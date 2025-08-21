import os
from openpyxl import load_workbook


def process_excel(file_path: str) -> dict:
    # Aquí puedes implementar la lógica real de lectura del Excel.
    # Por ahora devolvemos un ejemplo similar al backend Node.
    # Elimina el archivo al finalizar.
    try:
        load_workbook(file_path)  # lectura simple para validar
        cotizacion = {
            "procedimiento": {
                "nombre": "Procedimiento de ejemplo",
                "descripcion": "Descripción del procedimiento extraída del Excel",
            },
            "materiales": [
                {"descripcion": "Material 1", "cantidad": 2, "precioUnitario": 100.0, "total": 200.0},
                {"descripcion": "Material 2", "cantidad": 3, "precioUnitario": 150.0, "total": 450.0},
            ],
            "manoDeObra": [
                {"descripcion": "Trabajo 1", "cantidad": 5, "precioUnitario": 80.0, "total": 400.0},
                {"descripcion": "Trabajo 2", "cantidad": 2, "precioUnitario": 120.0, "total": 240.0},
            ],
            "totales": {
                "materiales": 650.0,
                "manoDeObra": 640.0,
                "general": 1290.0,
            },
        }
        return cotizacion
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)