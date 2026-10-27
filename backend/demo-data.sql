-- Datos opcionales para una base de demostración; no crea usuarios ni contraseñas.
INSERT INTO Vehiculos (tipo_vehiculo,marca,modelo,anio,precio,caracteristicas,imagen_url,estado)
SELECT 'Camión','Freightliner','Cascadia 2018',2018,45000.00,'Motor Detroit, transmisión automática','/uploads/1792970258960.jpg','Disponible'
WHERE NOT EXISTS (SELECT 1 FROM Vehiculos WHERE marca='Freightliner' AND modelo='Cascadia 2018' AND anio=2018);
INSERT INTO Vehiculos (tipo_vehiculo,marca,modelo,anio,precio,caracteristicas,imagen_url,estado)
SELECT 'Camión','Volvo','VNL 860',2020,62000.00,'Cabina dormitorio, motor D13','/uploads/1792974471095.jpg','Disponible'
WHERE NOT EXISTS (SELECT 1 FROM Vehiculos WHERE marca='Volvo' AND modelo='VNL 860' AND anio=2020);
INSERT INTO Vehiculos (tipo_vehiculo,marca,modelo,anio,precio,caracteristicas,imagen_url,estado)
SELECT 'Carro','Toyota','Hilux 2022',2022,28000.00,'Pickup 4x4, diésel',NULL,'Reservado'
WHERE NOT EXISTS (SELECT 1 FROM Vehiculos WHERE marca='Toyota' AND modelo='Hilux 2022' AND anio=2022);
INSERT INTO Servicios (nombre_servicio,descripcion,tarifa_estimada)
SELECT 'Alquiler de Transporte','Alquiler de camiones para mudanzas o logística.',150.00
WHERE NOT EXISTS (SELECT 1 FROM Servicios WHERE nombre_servicio='Alquiler de Transporte');
INSERT INTO Servicios (nombre_servicio,descripcion,tarifa_estimada)
SELECT 'Transporte de Carga','Traslado de mercancía a nivel nacional.',200.00
WHERE NOT EXISTS (SELECT 1 FROM Servicios WHERE nombre_servicio='Transporte de Carga');
INSERT INTO Vacantes (titulo_puesto,descripcion_puesto,estado_vacante,fecha_publicacion)
SELECT 'Conductor de Camión de Carga','Licencia tipo C, experiencia mínima de 2 años.','Activa',CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Vacantes WHERE titulo_puesto='Conductor de Camión de Carga');
