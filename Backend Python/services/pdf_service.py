import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output')

os.makedirs(OUTPUT_DIR, exist_ok=True)


def format_number(num: float) -> str:
    return f"{num:,.2f}".replace(",", ".")


def generate_pdf(procedimiento: dict, materiales: list, mano_de_obra: list, totales: dict) -> str:
    filename = f"cotizacion-{int(datetime.utcnow().timestamp() * 1000)}.pdf"
    pdf_path = os.path.join(OUTPUT_DIR, filename)

    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    y = height - 50
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, "COTIZACIÓN")
    y -= 30

    c.setFont("Helvetica", 12)
    c.drawRightString(width - 50, y, f"Fecha: {datetime.now().strftime('%d/%m/%Y')}")
    y -= 40

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Información del Procedimiento")
    y -= 20
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Nombre: {procedimiento.get('nombre', '')}")
    y -= 20
    c.drawString(50, y, f"Descripción: {procedimiento.get('descripcion', '')}")
    y -= 30

    if materiales:
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Materiales")
        y -= 20
        c.setFont("Helvetica", 10)
        c.drawString(50, y, "Descripción")
        c.drawString(250, y, "Cantidad")
        c.drawString(330, y, "Precio Unitario")
        c.drawString(430, y, "Total")
        y -= 10
        c.line(50, y, 530, y)
        y -= 10

        for m in materiales:
            c.drawString(50, y, str(m.get('descripcion', '')))
            c.drawString(250, y, str(m.get('cantidad', '')))
            c.drawString(330, y, f"${format_number(float(m.get('precioUnitario', 0)))}")
            c.drawString(430, y, f"${format_number(float(m.get('total', 0)))}")
            y -= 15

        y -= 10
        c.line(50, y, 530, y)
        y -= 10
        c.drawString(330, y, "Total Materiales:")
        c.drawString(430, y, f"${format_number(float(totales.get('materiales', 0)))}")
        y -= 30

    if mano_de_obra:
        if y < 120:
            c.showPage()
            y = height - 50
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Mano de Obra")
        y -= 20
        c.setFont("Helvetica", 10)
        c.drawString(50, y, "Descripción")
        c.drawString(250, y, "Cantidad")
        c.drawString(330, y, "Precio Unitario")
        c.drawString(430, y, "Total")
        y -= 10
        c.line(50, y, 530, y)
        y -= 10

        for item in mano_de_obra:
            c.drawString(50, y, str(item.get('descripcion', '')))
            c.drawString(250, y, str(item.get('cantidad', '')))
            c.drawString(330, y, f"${format_number(float(item.get('precioUnitario', 0)))}")
            c.drawString(430, y, f"${format_number(float(item.get('total', 0)))}")
            y -= 15

        y -= 10
        c.line(50, y, 530, y)
        y -= 10
        c.drawString(330, y, "Total Mano de Obra:")
        c.drawString(430, y, f"${format_number(float(totales.get('manoDeObra', 0)))}")
        y -= 30

    if y < 120:
        c.showPage()
        y = height - 50

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Resumen")
    y -= 20
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Total Materiales: ${format_number(float(totales.get('materiales', 0)))}")
    y -= 15
    c.drawString(50, y, f"Total Mano de Obra: ${format_number(float(totales.get('manoDeObra', 0)))}")
    y -= 15
    c.setFont("Helvetica-Bold", 16)
    c.drawRightString(530, y, f"TOTAL GENERAL: ${format_number(float(totales.get('general', 0)))}")

    c.save()
    return pdf_path