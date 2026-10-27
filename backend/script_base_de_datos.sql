
CREATE DATABASE IF NOT EXISTS import_truck_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE import_truck_db;

-- ==========================================
-- 1. TABLA USUARIOS (Para el Login Admin)
-- ==========================================
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'admin', 'empleado'
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TABLA VEHICULOS
-- ==========================================
CREATE TABLE IF NOT EXISTS Vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    caracteristicas TEXT,
    imagen_url VARCHAR(255), -- Aquí va el link o la ruta de la imagen
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' -- 'Disponible', 'Vendido', 'Reservado'
);

-- ==========================================
-- 3. TABLA SERVICIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS Servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    tarifa_estimada DECIMAL(10,2) NOT NULL
);

-- ==========================================
-- 4. TABLA COTIZACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS Cotizaciones (
    id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    correo_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(15) NOT NULL,
    requerimiento TEXT NOT NULL,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_vehiculo INT,
    id_servicio INT,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo) ON DELETE SET NULL,
    FOREIGN KEY (id_servicio) REFERENCES Servicios(id_servicio) ON DELETE SET NULL
);

-- ==========================================
-- 5. TABLA MENSAJES_CONTACTO
-- ==========================================
CREATE TABLE IF NOT EXISTS Mensajes_Contacto (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    nombre_remitente VARCHAR(100) NOT NULL,
    correo_remitente VARCHAR(100) NOT NULL,
    asunto VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TABLA VACANTES
-- ==========================================
CREATE TABLE IF NOT EXISTS Vacantes (
    id_vacante INT AUTO_INCREMENT PRIMARY KEY,
    titulo_puesto VARCHAR(100) NOT NULL,
    descripcion_puesto TEXT NOT NULL,
    estado_vacante VARCHAR(20) NOT NULL DEFAULT 'Activa', -- 'Activa', 'Cerrada'
    fecha_publicacion DATE NOT NULL
);

-- ==========================================
-- 7. TABLA SOLICITUD_EMPLEO
-- ==========================================
CREATE TABLE IF NOT EXISTS Solicitud_Empleo (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_vacante INT,
    nombre_candidato VARCHAR(100) NOT NULL,
    correo_candidato VARCHAR(100) NOT NULL,
    telefono_candidato VARCHAR(15) NOT NULL,
    experiencia TEXT NOT NULL,
    fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vacante) REFERENCES Vacantes(id_vacante) ON DELETE SET NULL
);

-- ==========================================
-- DATOS DE PRUEBA (Para que no empieces en blanco)
-- ==========================================
-- Insertar algunos vehículos de prueba
INSERT INTO Vehiculos (tipo_vehiculo, marca, modelo, anio, precio, caracteristicas, imagen_url, estado) VALUES
('Camión', 'Freightliner', 'Cascadia 2018', 2018, 45000.00, 'Motor Detroit, Transmisión automática, 500k millas', 'https://ejemplo.com/camion1.jpg', 'Disponible'),
('Camión', 'Volvo', 'VNL 860', 2020, 62000.00, 'Cabina dormitorio, Motor D13, Excelente estado', '/uploads/volvo-vnl.jpg', 'Disponible'),
('Carro', 'Toyota', 'Hilux 2022', 2022, 28000.00, 'Pickup 4x4, Diésel, Poco kilometraje', NULL, 'Reservado');

-- Insertar un servicio de prueba
INSERT INTO Servicios (nombre_servicio, descripcion, tarifa_estimada) VALUES
('Alquiler de Transporte', 'Servicio de alquiler de camiones de carga para mudanzas o logística.', 150.00),
('Transporte de Carga', 'Traslado de mercancía a nivel nacional con conductores certificados.', 200.00);

-- Insertar una vacante
INSERT INTO Vacantes (titulo_puesto, descripcion_puesto, estado_vacante, fecha_publicacion) VALUES
('Conductor de Camión de Carga', 'Se requiere conductor con licencia tipo C, experiencia mínima de 2 años.', 'Activa', '2026-09-01');