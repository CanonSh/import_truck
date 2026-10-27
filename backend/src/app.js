const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const app = express();

// Middlewares globales
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const origins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((origin) => origin.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use("/api/public", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100,
  standardHeaders: "draft-8", legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." } }));

// Servir la carpeta de imágenes estáticamente
// Ejemplo: http://localhost:3000/uploads/123456.jpg
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Importar Rutas
const authRoutes = require("./routes/auth.routes");
const vehiculoRoutes = require("./routes/vehiculo.routes");
const publicRoutes = require("./routes/public.routes");
const adminRoutes = require("./routes/admin.routes");

// Usar Rutas
app.use("/api/auth", authRoutes);
app.use("/api/vehiculos", vehiculoRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores (DEBE tener 4 parámetros: err, req, res, next)
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.message);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Solicitud inválida",
      detalles: [
        { campo: "body", mensaje: "El cuerpo debe contener JSON válido." },
      ],
    });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Solicitud demasiado grande" });
  }
  if (err.message === "El archivo debe ser una imagen") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "Archivo demasiado grande (máx 5MB)" });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ error: "Carga de archivo inválida" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
