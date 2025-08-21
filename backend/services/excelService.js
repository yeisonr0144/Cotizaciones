const ExcelJS = require('exceljs');
const fs = require('fs');

async function processExcel(filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    // Aquí podrías leer hojas y celdas reales.
    const cotizacion = {
      procedimiento: {
        nombre: 'Procedimiento de ejemplo',
        descripcion: 'Descripción del procedimiento extraída del Excel',
      },
      materiales: [
        { descripcion: 'Material 1', cantidad: 2, precioUnitario: 100, total: 200 },
        { descripcion: 'Material 2', cantidad: 3, precioUnitario: 150, total: 450 },
      ],
      manoDeObra: [
        { descripcion: 'Trabajo 1', cantidad: 5, precioUnitario: 80, total: 400 },
        { descripcion: 'Trabajo 2', cantidad: 2, precioUnitario: 120, total: 240 },
      ],
      totales: { materiales: 650, manoDeObra: 640, general: 1290 },
    };
    return cotizacion;
  } finally {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
}

module.exports = { processExcel };