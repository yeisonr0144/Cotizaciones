const sql = require('mssql');
require('dotenv').config();

console.log('=== DIAGNÓSTICO DE CONEXIÓN SQL SERVER EXPRESS ===\n');

// Mostrar configuración
console.log('Configuración de conexión:');
console.log(`- Servidor: ${process.env.DB_SERVER}`);
console.log(`- Base de datos: ${process.env.DB_DATABASE}`);
console.log(`- Usuario: ${process.env.DB_USER}`);
console.log(`- Contraseña: ${process.env.DB_PASSWORD ? '[CONFIGURADA]' : '[NO CONFIGURADA]'}`);
console.log(`- Encrypt: ${process.env.DB_ENCRYPT}`);
console.log(`- TrustServerCertificate: ${process.env.DB_TRUST_SERVER_CERTIFICATE}\n`);

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function diagnosticar() {
  console.log('Iniciando diagnóstico...\n');
  
  try {
    console.log('1. Intentando conectar a SQL Server Express...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ CONEXIÓN EXITOSA!');
    
    console.log('\n2. Verificando versión de SQL Server...');
    const versionResult = await pool.request().query('SELECT @@VERSION as version');
    console.log(`Versión: ${versionResult.recordset[0].version}`);
    
    console.log('\n3. Verificando base de datos actual...');
    const dbResult = await pool.request().query('SELECT DB_NAME() as current_db');
    console.log(`Base de datos actual: ${dbResult.recordset[0].current_db}`);
    
    console.log('\n4. Listando bases de datos disponibles...');
    const dbsResult = await pool.request().query('SELECT name FROM sys.databases WHERE name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')');
    console.log('Bases de datos de usuario:');
    dbsResult.recordset.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    console.log('\n5. Verificando si existe la base de datos CotizacionesDB...');
    const existsResult = await pool.request()
      .input('dbname', sql.VarChar, 'CotizacionesDB')
      .query('SELECT COUNT(*) as exists FROM sys.databases WHERE name = @dbname');
    
    if (existsResult.recordset[0].exists > 0) {
      console.log('✅ La base de datos CotizacionesDB existe');
      
      console.log('\n6. Verificando tablas en CotizacionesDB...');
      await pool.request().query('USE CotizacionesDB');
      const tablesResult = await pool.request().query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'');
      
      if (tablesResult.recordset.length > 0) {
        console.log('Tablas encontradas:');
        tablesResult.recordset.forEach(table => {
          console.log(`  - ${table.TABLE_NAME}`);
        });
      } else {
        console.log('⚠️  No se encontraron tablas en la base de datos');
      }
    } else {
      console.log('❌ La base de datos CotizacionesDB NO existe');
      console.log('\nSOLUCIÓN: Necesitas crear la base de datos CotizacionesDB primero.');
      console.log('Puedes usar SQL Server Management Studio o ejecutar:');
      console.log('CREATE DATABASE CotizacionesDB;');
    }
    
    await pool.close();
    console.log('\n✅ DIAGNÓSTICO COMPLETADO - La conexión funciona correctamente');
    
  } catch (error) {
    console.log('❌ ERROR EN LA CONEXIÓN:');
    console.log(`Código de error: ${error.code}`);
    console.log(`Mensaje: ${error.message}`);
    
    console.log('\n=== POSIBLES SOLUCIONES ===');
    
    if (error.code === 'ETIMEOUT') {
      console.log('\n🔧 PROBLEMA: Timeout de conexión');
      console.log('CAUSAS POSIBLES:');
      console.log('1. SQL Server Express no está ejecutándose');
      console.log('2. TCP/IP no está habilitado en SQL Server');
      console.log('3. Puerto bloqueado por firewall');
      console.log('4. Instancia SQLEXPRESS no está configurada correctamente');
      
      console.log('\nSOLUCIONES:');
      console.log('1. Verificar que el servicio MSSQL$SQLEXPRESS esté ejecutándose');
      console.log('2. Abrir SQL Server Configuration Manager');
      console.log('3. Ir a SQL Server Network Configuration > Protocols for SQLEXPRESS');
      console.log('4. Habilitar TCP/IP');
      console.log('5. Reiniciar el servicio SQL Server Express');
    }
    
    if (error.code === 'ELOGIN') {
      console.log('\n🔧 PROBLEMA: Error de autenticación');
      console.log('CAUSAS POSIBLES:');
      console.log('1. Usuario o contraseña incorrectos');
      console.log('2. Autenticación SQL Server no habilitada');
      console.log('3. Usuario no existe o no tiene permisos');
      
      console.log('\nSOLUCIONES:');
      console.log('1. Verificar credenciales en SQL Server Management Studio');
      console.log('2. Habilitar autenticación mixta (Windows + SQL Server)');
      console.log('3. Crear el usuario YeisonPruebas si no existe');
    }
    
    if (error.code === 'EINSTLOOKUP') {
      console.log('\n🔧 PROBLEMA: No se puede encontrar la instancia');
      console.log('CAUSAS POSIBLES:');
      console.log('1. La instancia SQLEXPRESS no existe');
      console.log('2. SQL Server Browser no está ejecutándose');
      console.log('3. Configuración de red incorrecta');
      
      console.log('\nSOLUCIONES:');
      console.log('1. Verificar que SQL Server Express esté instalado');
      console.log('2. Iniciar el servicio SQL Server Browser');
      console.log('3. Verificar el nombre de la instancia');
    }
    
    console.log('\n📋 PASOS RECOMENDADOS:');
    console.log('1. Abrir SQL Server Management Studio');
    console.log('2. Conectarse con: localhost\\SQLEXPRESS');
    console.log('3. Usar autenticación de Windows primero');
    console.log('4. Verificar que la base de datos CotizacionesDB existe');
    console.log('5. Crear el usuario YeisonPruebas si es necesario');
    console.log('6. Habilitar autenticación mixta en las propiedades del servidor');
  }
}

diagnosticar();