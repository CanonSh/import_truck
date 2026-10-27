const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const adminController = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
const {
  requireObjectBody,
  requiredText,
  validateRequest,
} = require("../middlewares/validation.middleware");

const vacancyValidation = [
  requiredText("titulo_puesto", "El título del puesto", 100),
  requiredText("descripcion_puesto", "La descripción del puesto"),
  body("estado_vacante")
    .optional({ values: "falsy" })
    .isIn(["Activa", "Cerrada"])
    .withMessage("El estado de la vacante no es válido."),
  body("fecha_publicacion")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("La fecha de publicación debe tener formato YYYY-MM-DD."),
];

const vacancyIdValidation = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID de la vacante debe ser un entero positivo.");

// Todas protegidas
router.get(
  "/cotizaciones",
  verifyToken,
  verifyAdmin,
  adminController.getCotizaciones,
);
router.get(
  "/cotizaciones/:id",
  verifyToken,
  verifyAdmin,
  adminController.getCotizacionById,
);
router.get("/mensajes", verifyToken, verifyAdmin, adminController.getMensajes);
router.get(
  "/solicitudes",
  verifyToken,
  verifyAdmin,
  adminController.getSolicitudes,
);
router.get("/vacantes", verifyToken, verifyAdmin, adminController.getVacantes);
router.post(
  "/vacantes",
  verifyToken,
  verifyAdmin,
  requireObjectBody,
  ...vacancyValidation,
  validateRequest,
  adminController.createVacante,
);
router.put(
  "/vacantes/:id",
  verifyToken,
  verifyAdmin,
  vacancyIdValidation,
  requireObjectBody,
  ...vacancyValidation,
  validateRequest,
  adminController.updateVacante,
);
router.delete(
  "/vacantes/:id",
  verifyToken,
  verifyAdmin,
  vacancyIdValidation,
  validateRequest,
  adminController.deleteVacante,
);

module.exports = router;
