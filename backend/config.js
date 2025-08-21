// Archivo de configuración alternativo (opcional)
// Este archivo muestra una forma más estructurada de manejar la configuración

require('dotenv').config();

const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configuración de la base de datos
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server: process.env.DB_SERVER || 'localhost',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000
    },
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
  },

  // Configuración de archivos
  files: {
    uploadsDir: process.env.UPLOADS_DIR || 'uploads',
    outputDir: process.env.OUTPUT_DIR || 'output',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  }
};

// Validación de configuración crítica
function validateConfig() {
  const required = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_SERVER'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${missing.join(', ')}`);
  }
}

// Ejecutar validación al cargar el módulo
validateConfig();

module.exports = config;