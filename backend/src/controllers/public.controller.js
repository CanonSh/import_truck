const db = require('../config/db');

exports.crearCotizacion = async (req, res) => {
    const { nombre_cliente, correo_cliente, telefono_cliente, requerimiento, id_vehiculo, id_servicio } = req.body;
    try {
        await db.execute(
            'INSERT INTO Cotizaciones (nombre_cliente, correo_cliente, telefono_cliente, requerimiento, id_vehiculo, id_servicio) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_cliente, correo_cliente, telefono_cliente, requerimiento, id_vehiculo || null, id_servicio || null]
        );
        res.status(201).json({ mensaje: 'Cotización enviada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar cotización' });
    }
};

exports.crearMensaje = async (req, res) => {
    const { nombre_remitente, correo_remitente, asunto, mensaje } = req.body;
    try {
        await db.execute(
            'INSERT INTO Mensajes_Contacto (nombre_remitente, correo_remitente, asunto, mensaje) VALUES (?, ?, ?, ?)',
            [nombre_remitente, correo_remitente, asunto, mensaje]
        );
        res.status(201).json({ mensaje: 'Mensaje enviado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar mensaje' });
    }
};

exports.getVacantes = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Vacantes WHERE estado_vacante = 'Activa'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener vacantes' });
    }
};