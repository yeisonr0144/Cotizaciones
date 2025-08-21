const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { processExcel } = require('../services/excelService');
const { generatePdf } = require('../services/pdfService');

const router = express.Router();

const rootDir = path.join(__dirname, '..');
const uploadsDir = path.join(rootDir, 'uploads');
const outputDir = path.join(rootDir, 'output');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/generate-quote', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo' });
    }
    const cotizacion = await processExcel(req.file.path);
    res.json({ success: true, cotizacion });
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el archivo Excel' });
  }
});

router.post('/generate-pdf', async (req, res) => {
  try {
    const { procedimiento, materiales, manoDeObra, totales } = req.body;
    const { pdfPath, filename } = await generatePdf({ procedimiento, materiales, manoDeObra, totales }, outputDir);
    res.json({ success: true, pdfPath: `/api/download-pdf/${filename}` });
  } catch (error) {
    console.error('Error en la generación del PDF:', error);
    res.status(500).json({ success: false, message: 'Error en la generación del PDF' });
  }
});

router.get('/download-pdf/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(outputDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error al descargar el PDF:', err);
        return res.status(500).json({ success: false, message: 'Error al descargar el PDF' });
      }
    });
  } catch (error) {
    console.error('Error en la descarga del PDF:', error);
    res.status(500).json({ success: false, message: 'Error en la descarga del PDF' });
  }
});

module.exports = router;