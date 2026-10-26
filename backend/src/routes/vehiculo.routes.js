const express = require("express");
const router = express.Router();
const vehiculoController = require("../controllers/vehiculo.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Ruta pública (Catálogo)
router.get("/", vehiculoController.getVehiculos);
router.get("/:id", vehiculoController.getVehiculoById);

// Rutas privadas (Solo Admin logueado)
// Usamos upload.single('imagen') para permitir subida de archivos (el campo en el FormData debe llamarse 'imagen')

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("imagen"),
  vehiculoController.createVehiculo,
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  vehiculoController.deleteVehiculo,
);

module.exports = router;
