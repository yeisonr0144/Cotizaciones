-- Script para crear la base de datos y tablas para el sistema de cotizaciones

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CotizacionesDB')
BEGIN
    CREATE DATABASE CotizacionesDB;
END
GO

-- Usar la base de datos
USE CotizacionesDB;
GO

-- Crear tabla de Procedimientos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Procedimientos')
BEGIN
    CREATE TABLE Procedimientos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(255) NOT NULL,
        descripcion NVARCHAR(MAX),
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Crear tabla de Cotizaciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cotizaciones')
BEGIN
    CREATE TABLE Cotizaciones (
        id INT IDENTITY(1,1) PRIMARY KEY,
        procedimiento_id INT FOREIGN KEY REFERENCES Procedimientos(id),
        total_materiales DECIMAL(18,2) NOT NULL,
        total_mano_obra DECIMAL(18,2) NOT NULL,
        total_general DECIMAL(18,2) NOT NULL,
        pdf_path NVARCHAR(255),
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Crear tabla de Materiales
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Materiales')
BEGIN
    CREATE TABLE Materiales (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cotizacion_id INT FOREIGN KEY REFERENCES Cotizaciones(id),
        descripcion NVARCHAR(255) NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(18,2) NOT NULL,
        total DECIMAL(18,2) NOT NULL
    );
END
GO

-- Crear tabla de Mano de Obra
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ManoDeObra')
BEGIN
    CREATE TABLE ManoDeObra (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cotizacion_id INT FOREIGN KEY REFERENCES Cotizaciones(id),
        descripcion NVARCHAR(255) NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(18,2) NOT NULL,
        total DECIMAL(18,2) NOT NULL
    );
END
GO

-- Instrucciones para el usuario:
-- 1. Abra SQL Server Management Studio
-- 2. Conéctese a su instancia de SQL Server
-- 3. Abra este archivo y ejecútelo para crear la base de datos y las tablas
-- 4. Actualice la configuración de conexión en el archivo index.js con sus credenciales de SQL Server