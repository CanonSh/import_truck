const db = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

const uploadsDir = path.resolve(__dirname, "../../uploads");

const removeUploadedFile = async (file) => {
  if (!file?.path) return;
  const filePath = path.resolve(file.path);
  if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const removeImageIfUnreferenced = async (imageUrl) => {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) return;

  const filename = imageUrl.slice("/uploads/".length);
  if (!filename || path.basename(filename) !== filename) return;

  const [rows] = await db.execute(
    "SELECT COUNT(*) AS total FROM Vehiculos WHERE imagen_url = ?",
    [imageUrl],
  );
  if (Number(rows[0].total) > 0) return;

  await removeUploadedFile({ path: path.join(uploadsDir, filename) });
};

// Obtener vehículos (Público, con filtros como pide el documento)
exports.getVehiculos = async (req, res) => {
  try {
    const { marca, anio, busqueda } = req.query;
    let query = "SELECT * FROM Vehiculos WHERE 1=1";
    let params = [];

    if (marca) {
      query += " AND marca = ?";
      params.push(marca);
    }
    if (anio) {
      query += " AND anio = ?";
      params.push(anio);
    }
    if (busqueda) {
      query += " AND (modelo LIKE ? OR marca LIKE ? OR caracteristicas LIKE ?)";
      params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar vehículos" });
  }
};

// Obtener un vehículo por ID
exports.getVehiculoById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Vehiculos WHERE id_vehiculo = ?",
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(rows[0]); // Devuelve solo el objeto, no un array
  } catch (error) {
    res.status(500).json({ error: "Error al consultar el vehículo" });
  }
};

// Crear vehículo (Admin)
exports.createVehiculo = async (req, res) => {
  const {
    tipo_vehiculo,
    marca,
    modelo,
    anio,
    precio,
    caracteristicas,
    estado,
  } = req.body;
  let imagen_url = null;
  if (req.file) {
    imagen_url = `/uploads/${req.file.filename}`;
  } else if (
    typeof req.body.imagen_url === "string" &&
    req.body.imagen_url.trim() !== ""
  ) {
    imagen_url = req.body.imagen_url.trim();
  }

  try {
    const query = `INSERT INTO Vehiculos (tipo_vehiculo, marca, modelo, anio, precio, caracteristicas, imagen_url, estado) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [
      tipo_vehiculo,
      marca,
      modelo,
      anio,
      precio,
      caracteristicas || null,
      imagen_url,
      estado || "Disponible",
    ]);
    res
      .status(201)
      .json({ mensaje: "Vehículo creado", id: result.insertId, imagen_url });
  } catch (error) {
    try {
      await removeUploadedFile(req.file);
    } catch (cleanupError) {
      return res.status(500).json({ error: "Error al crear vehículo" });
    }
    res.status(500).json({ error: "Error al crear vehículo" });
  }
};

exports.updateVehiculo = async (req, res) => {
  const {
    tipo_vehiculo,
    marca,
    modelo,
    anio,
    precio,
    caracteristicas,
    estado,
    imagen_url: imagenUrlBody,
  } = req.body;
  let connection;
  let transactionOpen = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionOpen = true;

    const [rows] = await connection.execute(
      "SELECT * FROM Vehiculos WHERE id_vehiculo = ? FOR UPDATE",
      [req.params.id],
    );
    if (rows.length === 0) {
      await connection.rollback();
      transactionOpen = false;
      await removeUploadedFile(req.file);
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const actual = rows[0];
    const imagen_url = req.file
      ? `/uploads/${req.file.filename}`
      : typeof imagenUrlBody === "string" && imagenUrlBody.trim() !== ""
        ? imagenUrlBody.trim()
        : actual.imagen_url;

    await connection.execute(
      `UPDATE Vehiculos
             SET tipo_vehiculo = ?, marca = ?, modelo = ?, anio = ?, precio = ?,
                 caracteristicas = ?, imagen_url = ?, estado = ?
             WHERE id_vehiculo = ?`,
      [
        tipo_vehiculo,
        marca,
        modelo,
        anio,
        precio,
        caracteristicas || null,
        imagen_url,
        estado || actual.estado,
        req.params.id,
      ],
    );

    await connection.commit();
    transactionOpen = false;

    if (actual.imagen_url && actual.imagen_url !== imagen_url) {
      removeImageIfUnreferenced(actual.imagen_url).catch(() => {});
    }

    return res.json({
      mensaje: "Vehículo actualizado",
      id: Number(req.params.id),
      imagen_url,
    });
  } catch (error) {
    if (connection && transactionOpen) {
      try {
        await connection.rollback();
      } catch {}
    }
    try {
      await removeUploadedFile(req.file);
    } catch {}
    return res.status(500).json({ error: "Error al actualizar vehículo" });
  } finally {
    if (connection) connection.release();
  }
};

// Eliminar vehículo (Admin)
exports.deleteVehiculo = async (req, res) => {
  let connection;
  let transactionOpen = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionOpen = true;

    const [rows] = await connection.execute(
      "SELECT imagen_url FROM Vehiculos WHERE id_vehiculo = ? FOR UPDATE",
      [req.params.id],
    );
    if (rows.length === 0) {
      await connection.rollback();
      transactionOpen = false;
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    await connection.execute("DELETE FROM Vehiculos WHERE id_vehiculo = ?", [
      req.params.id,
    ]);
    await connection.commit();
    transactionOpen = false;

    if (rows[0].imagen_url) {
      removeImageIfUnreferenced(rows[0].imagen_url).catch(() => {});
    }

    return res.json({ mensaje: "Vehículo eliminado" });
  } catch (error) {
    if (connection && transactionOpen) {
      try {
        await connection.rollback();
      } catch {}
    }
    return res.status(500).json({ error: "Error al eliminar vehículo" });
  } finally {
    if (connection) connection.release();
  }
};
