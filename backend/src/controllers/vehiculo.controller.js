const db = require('../config/db');

// Obtener vehículos (Público, con filtros como pide el documento)
exports.getVehiculos = async (req, res) => {
    try {
        const { marca, anio, busqueda } = req.query;
        let query = 'SELECT * FROM Vehiculos WHERE 1=1';
        let params = [];

        if (marca) { query += ' AND marca = ?'; params.push(marca); }
        if (anio) { query += ' AND anio = ?'; params.push(anio); }
        if (busqueda) { 
            query += ' AND (modelo LIKE ? OR marca LIKE ? OR caracteristicas LIKE ?)'; 
            params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`); 
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar vehículos' });
    }
};

// Obtener un vehículo por ID
exports.getVehiculoById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM Vehiculos WHERE id_vehiculo = ?', 
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }
        
        res.json(rows[0]); // Devuelve solo el objeto, no un array
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el vehículo' });
    }
};

// Crear vehículo (Admin)
exports.createVehiculo = async (req, res) => {
    const { tipo_vehiculo, marca, modelo, anio, precio, caracteristicas, estado } = req.body;

    // 🔍 Logs para depurar
    console.log('📦 Body:', req.body);
    console.log('📎 File:', req.file ? req.file.filename : 'ninguno');

    // Validar campos obligatorios (evita errores 500 por columnas NOT NULL)
    if (!tipo_vehiculo || !marca || !modelo || !anio || !precio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Limpieza de la URL
    let imagen_url = null;
    if (req.file) {
        imagen_url = `/uploads/${req.file.filename}`;
    } else if (typeof req.body.imagen_url === 'string' && req.body.imagen_url.trim() !== '') {
        imagen_url = req.body.imagen_url.trim();
    }

    try {
        const query = `INSERT INTO Vehiculos (tipo_vehiculo, marca, modelo, anio, precio, caracteristicas, imagen_url, estado) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [
            tipo_vehiculo, marca, modelo, anio, precio,
            caracteristicas || null, imagen_url, estado || 'Disponible'
        ]);
        res.status(201).json({ mensaje: 'Vehículo creado', id: result.insertId, imagen_url });
    } catch (error) {
        console.error('Error BD:', error);
        res.status(500).json({ error: 'Error al crear vehículo' });
    }
};

// Eliminar vehículo (Admin)
exports.deleteVehiculo = async (req, res) => {
    try {
        await db.execute('DELETE FROM Vehiculos WHERE id_vehiculo = ?', [req.params.id]);
        res.json({ mensaje: 'Vehículo eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
};