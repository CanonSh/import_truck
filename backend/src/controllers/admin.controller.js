const db = require('../config/db');

// Listar todas las cotizaciones (con datos del vehículo/servicio)
exports.getCotizaciones = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*, v.marca, v.modelo, s.nombre_servicio 
            FROM Cotizaciones c
            LEFT JOIN Vehiculos v ON c.id_vehiculo = v.id_vehiculo
            LEFT JOIN Servicios s ON c.id_servicio = s.id_servicio
            ORDER BY c.fecha_solicitud DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar cotizaciones' });
    }
};

// Obtener una cotización por ID
exports.getCotizacionById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM Cotizaciones WHERE id_cotizacion = ?', 
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar' });
    }
};

// Listar mensajes de contacto
exports.getMensajes = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Mensajes_Contacto ORDER BY fecha_envio DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar mensajes' });
    }
};

// Listar solicitudes de empleo (con el puesto)
exports.getSolicitudes = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.*, v.titulo_puesto 
            FROM Solicitud_Empleo s
            LEFT JOIN Vacantes v ON s.id_vacante = v.id_vacante
            ORDER BY s.fecha_postulacion DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar solicitudes' });
    }
};