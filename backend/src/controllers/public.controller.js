const db = require("../config/db");

exports.crearCotizacion = async (req, res) => {
  const {
    nombre_cliente,
    correo_cliente,
    telefono_cliente,
    requerimiento,
    id_vehiculo,
    id_servicio,
  } = req.body;
  try {
    await db.execute(
      "INSERT INTO Cotizaciones (nombre_cliente, correo_cliente, telefono_cliente, requerimiento, id_vehiculo, id_servicio) VALUES (?, ?, ?, ?, ?, ?)",
      [
        nombre_cliente,
        correo_cliente,
        telefono_cliente,
        requerimiento,
        id_vehiculo || null,
        id_servicio || null,
      ],
    );
    res.status(201).json({ mensaje: "Cotización enviada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar cotización" });
  }
};

exports.crearMensaje = async (req, res) => {
  const { nombre_remitente, correo_remitente, asunto, mensaje } = req.body;
  try {
    await db.execute(
      "INSERT INTO Mensajes_Contacto (nombre_remitente, correo_remitente, asunto, mensaje) VALUES (?, ?, ?, ?)",
      [nombre_remitente, correo_remitente, asunto, mensaje],
    );
    res.status(201).json({ mensaje: "Mensaje enviado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar mensaje" });
  }
};

exports.crearPostulacion = async (req, res) => {
  const {
    id_vacante,
    nombre_candidato,
    correo_candidato,
    telefono_candidato,
    experiencia,
  } = req.body;
  let connection;
  let transactionOpen = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionOpen = true;

    const [vacantes] = await connection.execute(
      "SELECT id_vacante, estado_vacante FROM Vacantes WHERE id_vacante = ? FOR UPDATE",
      [id_vacante],
    );

    if (vacantes.length === 0) {
      await connection.rollback();
      transactionOpen = false;
      return res.status(404).json({ error: "Vacante no encontrada" });
    }

    if (vacantes[0].estado_vacante !== "Activa") {
      await connection.rollback();
      transactionOpen = false;
      return res.status(409).json({ error: "La vacante no está activa" });
    }

    const [result] = await connection.execute(
      "INSERT INTO Solicitud_Empleo (id_vacante, nombre_candidato, correo_candidato, telefono_candidato, experiencia) VALUES (?, ?, ?, ?, ?)",
      [
        id_vacante,
        nombre_candidato,
        correo_candidato,
        telefono_candidato,
        experiencia,
      ],
    );

    await connection.commit();
    transactionOpen = false;
    return res
      .status(201)
      .json({ mensaje: "Postulación recibida", id: result.insertId });
  } catch (error) {
    if (connection && transactionOpen) {
      try {
        await connection.rollback();
      } catch {}
    }

    return res
      .status(500)
      .json({ error: "Error interno al registrar postulación" });
  } finally {
    if (connection) connection.release();
  }
};

exports.getVacantes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Vacantes WHERE estado_vacante = 'Activa'",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vacantes" });
  }
};
