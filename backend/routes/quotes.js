const express = require('express');
const { sql, sqlConfig } = require('../db/connection');

const router = express.Router();

router.get('/quotes', async (req, res) => {
  try {
    await sql.connect(sqlConfig);

    const tablesCheck = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('Cotizaciones', 'Procedimientos')
    `;

    if (tablesCheck.recordset.length < 2) {
      return res.status(500).json({ 
        success: false, 
        message: 'Las tablas necesarias no existen en la base de datos. Por favor ejecuta el script database.sql primero.',
        tablesFound: tablesCheck.recordset
      });
    }

    const result = await sql.query`
      SELECT c.id, c.total_general, c.pdf_path, c.fecha_creacion, p.nombre, p.descripcion
      FROM Cotizaciones c
      JOIN Procedimientos p ON c.procedimiento_id = p.id
      ORDER BY c.fecha_creacion DESC
    `;

    res.json({ success: true, cotizaciones: result.recordset });
  } catch (error) {
    console.error('Error detallado al obtener las cotizaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las cotizaciones',
      error: error.message,
      code: error.code
    });
  } finally {
    try { await sql.close(); } catch (_) {}
  }
});

router.post('/save-quote', async (req, res) => {
  try {
    const { procedimiento, materiales, manoDeObra, totales, pdfPath } = req.body;
    await sql.connect(sqlConfig);

    const procedimientoResult = await sql.query`
      INSERT INTO Procedimientos (nombre, descripcion, fecha_creacion)
      VALUES (${procedimiento.nombre}, ${procedimiento.descripcion}, ${new Date()})
      SELECT SCOPE_IDENTITY() AS id
    `;

    const procedimientoId = procedimientoResult.recordset[0].id;

    const cotizacionResult = await sql.query`
      INSERT INTO Cotizaciones (procedimiento_id, total_materiales, total_mano_obra, total_general, pdf_path, fecha_creacion)
      VALUES (${procedimientoId}, ${totales.materiales}, ${totales.manoDeObra}, ${totales.general}, ${pdfPath}, ${new Date()})
      SELECT SCOPE_IDENTITY() AS id
    `;

    const cotizacionId = cotizacionResult.recordset[0].id;

    for (const material of materiales) {
      await sql.query`
        INSERT INTO Materiales (cotizacion_id, descripcion, cantidad, precio_unitario, total)
        VALUES (${cotizacionId}, ${material.descripcion}, ${material.cantidad}, ${material.precioUnitario}, ${material.total})
      `;
    }

    for (const item of manoDeObra) {
      await sql.query`
        INSERT INTO ManoDeObra (cotizacion_id, descripcion, cantidad, precio_unitario, total)
        VALUES (${cotizacionId}, ${item.descripcion}, ${item.cantidad}, ${item.precioUnitario}, ${item.total})
      `;
    }

    res.json({ success: true, cotizacionId });
  } catch (error) {
    console.error('Error al guardar la cotización en la base de datos:', error);
    res.status(500).json({ success: false, message: 'Error al guardar la cotización en la base de datos' });
  } finally {
    try { await sql.close(); } catch (_) {}
  }
});

module.exports = router;