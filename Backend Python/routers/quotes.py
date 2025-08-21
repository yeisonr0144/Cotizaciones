from fastapi import APIRouter, HTTPException
from db.connection import get_connection
import pyodbc
from time import time

router = APIRouter(tags=["Quotes"])

@router.get("/quotes")
async def get_quotes():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT c.id, c.total_general, c.pdf_path, c.fecha_creacion, p.nombre, p.descripcion
                FROM Cotizaciones c
                JOIN Procedimientos p ON c.procedimiento_id = p.id
                ORDER BY c.fecha_creacion DESC
                """
            )
            columns = [col[0] for col in cursor.description]
            records = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return {"success": True, "cotizaciones": records}
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-quote")
async def save_quote(payload: dict):
    try:
        procedimiento = payload.get("procedimiento", {})
        materiales = payload.get("materiales", [])
        mano_de_obra = payload.get("manoDeObra", [])
        totales = payload.get("totales", {})
        pdf_path = payload.get("pdfPath")

        with get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO Procedimientos (nombre, descripcion, fecha_creacion)
                VALUES (?, ?, ?);
                SELECT SCOPE_IDENTITY();
                """,
                procedimiento.get("nombre"),
                procedimiento.get("descripcion"),
                pyodbc.TimestampFromTicks(time())
            )
            procedimiento_id = int(cursor.fetchone()[0])

            cursor.execute(
                """
                INSERT INTO Cotizaciones (procedimiento_id, total_materiales, total_mano_obra, total_general, pdf_path, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, ?);
                SELECT SCOPE_IDENTITY();
                """,
                procedimiento_id,
                float(totales.get("materiales", 0)),
                float(totales.get("manoDeObra", 0)),
                float(totales.get("general", 0)),
                pdf_path,
                pyodbc.TimestampFromTicks(time())
            )
            cotizacion_id = int(cursor.fetchone()[0])

            for m in materiales:
                cursor.execute(
                    """
                    INSERT INTO Materiales (cotizacion_id, descripcion, cantidad, precio_unitario, total)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    cotizacion_id,
                    m.get("descripcion"),
                    int(m.get("cantidad", 0)),
                    float(m.get("precioUnitario", 0)),
                    float(m.get("total", 0)),
                )

            for item in mano_de_obra:
                cursor.execute(
                    """
                    INSERT INTO ManoDeObra (cotizacion_id, descripcion, cantidad, precio_unitario, total)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    cotizacion_id,
                    item.get("descripcion"),
                    int(item.get("cantidad", 0)),
                    float(item.get("precioUnitario", 0)),
                    float(item.get("total", 0)),
                )

            conn.commit()
            return {"success": True, "cotizacionId": cotizacion_id}
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))