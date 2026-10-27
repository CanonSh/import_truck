const express = require("express");
const router = express.Router();
const vehiculoController = require("../controllers/vehiculo.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  vehicleFieldsValidation,
  vehicleIdValidation,
  vehicleQueryValidation,
  validateVehicleRequest,
} = require("../middlewares/vehicle-validation.middleware");

// Ruta pública (Catálogo)
router.get("/", ...vehicleQueryValidation, validateVehicleRequest, vehiculoController.getVehiculos);
router.get("/:id", vehicleIdValidation, validateVehicleRequest, vehiculoController.getVehiculoById);

// Rutas privadas (Solo Admin logueado)
// Usamos upload.single('imagen') para permitir subida de archivos (el campo en el FormData debe llamarse 'imagen')

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("imagen"),
  ...vehicleFieldsValidation,
  validateVehicleRequest,
  vehiculoController.createVehiculo,
);

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  upload.single("imagen"),
  vehicleIdValidation,
  ...vehicleFieldsValidation,
  validateVehicleRequest,
  vehiculoController.updateVehiculo,
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  vehicleIdValidation,
  validateVehicleRequest,
  vehiculoController.deleteVehiculo,
);

module.exports = router;
