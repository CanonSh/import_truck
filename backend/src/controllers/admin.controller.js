const db = require("../config/db");

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
    res.status(500).json({ error: "Error al consultar cotizaciones" });
  }
};

// Obtener una cotización por ID
exports.getCotizacionById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Cotizaciones WHERE id_cotizacion = ?",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "No encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar" });
  }
};

// Listar mensajes de contacto
exports.getMensajes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Mensajes_Contacto ORDER BY fecha_envio DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar mensajes" });
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
    res.status(500).json({ error: "Error al consultar solicitudes" });
  }
};

exports.getVacantes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Vacantes ORDER BY fecha_publicacion DESC, id_vacante DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar vacantes" });
  }
};

exports.createVacante = async (req, res) => {
  const {
    titulo_puesto,
    descripcion_puesto,
    estado_vacante,
    fecha_publicacion,
  } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO Vacantes (titulo_puesto, descripcion_puesto, estado_vacante, fecha_publicacion) VALUES (?, ?, ?, ?)",
      [
        titulo_puesto.trim(),
        descripcion_puesto.trim(),
        estado_vacante || "Activa",
        fecha_publicacion,
      ],
    );
    res.status(201).json({ mensaje: "Vacante creada", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Error al crear vacante" });
  }
};

exports.updateVacante = async (req, res) => {
  const {
    titulo_puesto,
    descripcion_puesto,
    estado_vacante,
    fecha_publicacion,
  } = req.body;
  try {
    const [existing] = await db.execute(
      "SELECT id_vacante, estado_vacante FROM Vacantes WHERE id_vacante = ?",
      [req.params.id],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Vacante no encontrada" });
    }

    await db.execute(
      "UPDATE Vacantes SET titulo_puesto = ?, descripcion_puesto = ?, estado_vacante = ?, fecha_publicacion = ? WHERE id_vacante = ?",
      [
        titulo_puesto.trim(),
        descripcion_puesto.trim(),
        estado_vacante || existing[0].estado_vacante,
        fecha_publicacion,
        req.params.id,
      ],
    );
    res.json({ mensaje: "Vacante actualizada", id: Number(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar vacante" });
  }
};

exports.deleteVacante = async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM Vacantes WHERE id_vacante = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vacante no encontrada" });
    }
    res.json({ mensaje: "Vacante eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar vacante" });
  }
};
