const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function generatePdf({ procedimiento, materiales = [], manoDeObra = [], totales = {} }, outputDir) {
  ensureDir(outputDir);
  const filename = `cotizacion-${Date.now()}.pdf`;
  const pdfPath = path.join(outputDir, filename);

  const doc = new PDFDocument({ margin: 50 });
  const pdfStream = fs.createWriteStream(pdfPath);
  doc.pipe(pdfStream);

  // Header
  doc.fontSize(20).text('COTIZACIÓN', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(2);

  // Procedimiento
  doc.fontSize(16).text('Información del Procedimiento', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Nombre: ${procedimiento?.nombre ?? ''}`);
  doc.fontSize(12).text(`Descripción: ${procedimiento?.descripcion ?? ''}`);
  // campos adicionales
  if (procedimiento?.ubicacion) doc.fontSize(12).text(`Ubicación: ${procedimiento.ubicacion}`);
  const tiempoStr = [procedimiento?.tiempoEstimado, procedimiento?.tiempoUnidad].filter(Boolean).join(' ');
  if (tiempoStr) doc.fontSize(12).text(`Tiempo estimado: ${tiempoStr}`);
  if (procedimiento?.dependencias) doc.fontSize(12).text(`Dependencias: ${procedimiento.dependencias}`);
  if (procedimiento?.prioridad) doc.fontSize(12).text(`Prioridad/Fase: ${procedimiento.prioridad}`);
  if (procedimiento?.notas) doc.fontSize(12).text(`Notas: ${procedimiento.notas}`);
  doc.moveDown(2);

  // Materiales
  if (materiales.length > 0) {
    doc.fontSize(16).text('Materiales', { underline: true });
    doc.moveDown();

    const drawMaterialesHeader = () => {
      const top = doc.y; doc.fontSize(10);
      doc.text('Descripción', 50, top, { width: 200 });
      doc.text('Cantidad', 250, top, { width: 80 });
      doc.text('Precio Unitario', 330, top, { width: 100 });
      doc.text('Total', 430, top, { width: 80 });
      doc.moveTo(50, top + 20).lineTo(530, top + 20).stroke();
      return top + 30;
    };

    let yPos = drawMaterialesHeader();

    materiales.forEach(m => {
      // salto de página si es necesario
      if (yPos > 720) {
        doc.addPage();
        yPos = drawMaterialesHeader();
      }

      doc.fontSize(10);
      doc.text(m.descripcion, 50, yPos, { width: 200 });
      doc.text(String(m.cantidad), 250, yPos, { width: 80 });
      doc.text(`$${formatNumber(Number(m.precioUnitario).toFixed(2))}`, 330, yPos, { width: 100 });
      doc.text(`$${formatNumber(Number(m.total).toFixed(2))}`, 430, yPos, { width: 80 });
      yPos += 14;

      // línea de detalles adicionales
      const extraParts = [];
      if (m.unidadMedida) extraParts.push(`Unidad: ${m.unidadMedida}`);
      if (!isNaN(Number(m.desperdicio)) && Number(m.desperdicio) > 0) extraParts.push(`Desperdicio: ${Number(m.desperdicio)}%`);
      if (m.categoria) extraParts.push(`Categoría: ${m.categoria}`);
      if (m.proveedor) extraParts.push(`Proveedor: ${m.proveedor}`);
      if (m.notas) extraParts.push(`Notas: ${m.notas}`);
      if (extraParts.length > 0) {
        if (yPos > 740) { doc.addPage(); yPos = drawMaterialesHeader(); }
        doc.fontSize(9).fillColor('gray').text(extraParts.join(' | '), 50, yPos, { width: 480 });
        doc.fillColor('black');
        yPos += 12;
      }
    });

    doc.moveTo(50, yPos).lineTo(530, yPos).stroke();
    doc.text('Total Materiales:', 330, yPos + 10, { width: 100 });
    doc.text(`$${formatNumber(Number(totales.materiales || 0).toFixed(2))}`, 430, yPos + 10, { width: 80 });
    doc.moveDown(3);
  }

  if (doc.y > 650 && manoDeObra.length > 0) doc.addPage();

  // Mano de obra
  if (manoDeObra.length > 0) {
    doc.fontSize(16).text('Mano de Obra', { underline: true });
    doc.moveDown();

    const drawManoHeader = () => {
      const top = doc.y; doc.fontSize(10);
      doc.text('Descripción', 50, top, { width: 200 });
      doc.text('Cantidad', 250, top, { width: 80 });
      doc.text('Precio Unitario', 330, top, { width: 100 });
      doc.text('Total', 430, top, { width: 80 });
      doc.moveTo(50, top + 20).lineTo(530, top + 20).stroke();
      return top + 30;
    };

    let yPos = drawManoHeader();

    manoDeObra.forEach(item => {
      if (yPos > 720) { doc.addPage(); yPos = drawManoHeader(); }

      doc.fontSize(10);
      doc.text(item.descripcion, 50, yPos, { width: 200 });
      doc.text(String(item.cantidad), 250, yPos, { width: 80 });
      doc.text(`$${formatNumber(Number(item.precioUnitario).toFixed(2))}`, 330, yPos, { width: 100 });
      doc.text(`$${formatNumber(Number(item.total).toFixed(2))}`, 430, yPos, { width: 80 });
      yPos += 14;

      const extraParts = [];
      if (item.tipoUnidad) extraParts.push(`Tipo: ${item.tipoUnidad}`);
      if (!isNaN(Number(item.cantidadTrabajadores))) extraParts.push(`Trab: ${Number(item.cantidadTrabajadores)}`);
      if (!isNaN(Number(item.cantidadUnidades))) extraParts.push(`Unid: ${Number(item.cantidadUnidades)}`);
      if (!isNaN(Number(item.tarifaPorUnidad)) && item.tipoUnidad !== 'precioFijo') extraParts.push(`Tarifa: $${formatNumber(Number(item.tarifaPorUnidad).toFixed(2))}`);
      if (!isNaN(Number(item.costoAdicional)) && Number(item.costoAdicional) > 0) extraParts.push(`Adic: $${formatNumber(Number(item.costoAdicional).toFixed(2))}`);
      if (item.notas) extraParts.push(`Notas: ${item.notas}`);
      if (extraParts.length > 0) {
        if (yPos > 740) { doc.addPage(); yPos = drawManoHeader(); }
        doc.fontSize(9).fillColor('gray').text(extraParts.join(' | '), 50, yPos, { width: 480 });
        doc.fillColor('black');
        yPos += 12;
      }
    });

    doc.moveTo(50, yPos).lineTo(530, yPos).stroke();
    doc.text('Total Mano de Obra:', 330, yPos + 10, { width: 100 });
    doc.text(`$${formatNumber(Number(totales.manoDeObra || 0).toFixed(2))}`, 430, yPos + 10, { width: 80 });
    doc.moveDown(3);
  }

  if (doc.y > 700) doc.addPage();

  // Resumen
  doc.fontSize(14).text('Resumen', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Total Materiales: $${formatNumber(Number(totales.materiales || 0).toFixed(2))}`);
  doc.fontSize(12).text(`Total Mano de Obra: $${formatNumber(Number(totales.manoDeObra || 0).toFixed(2))}`);
  doc.moveDown();
  doc.fontSize(16).text(`TOTAL GENERAL: $${formatNumber(Number(totales.general || 0).toFixed(2))}`, { align: 'right' });

  doc.end();

  return new Promise((resolve, reject) => {
    pdfStream.on('finish', () => resolve({ pdfPath, filename }));
    pdfStream.on('error', reject);
  });
}

module.exports = { generatePdf };