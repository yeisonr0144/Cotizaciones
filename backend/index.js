const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routers
const filesRouter = require('./routes/files');
const quotesRouter = require('./routes/quotes');

// Health/root
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Node en ejecución' });
});

// API prefix
app.use('/api', filesRouter);
app.use('/api', quotesRouter);

// Start server
app.listen(port, host, () => {
  console.log(`Servidor backend ejecutándose en http://${host}:${port}`);
});