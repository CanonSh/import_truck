const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");
const { body } = require("express-validator");
const {
  requireObjectBody,
  requiredText,
  requiredEmail,
  validateRequest,
} = require("../middlewares/validation.middleware");

const cotizacionValidation = [
  requiredText("nombre_cliente", "El nombre del cliente", 100),
  requiredEmail("correo_cliente", "El correo del cliente"),
  requiredText("telefono_cliente", "El teléfono del cliente", 15),
  requiredText("requerimiento", "El requerimiento"),
  body("id_vehiculo")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("El ID del vehículo debe ser un entero positivo."),
  body("id_servicio")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("El ID del servicio debe ser un entero positivo."),
];

const contactoValidation = [
  requiredText("nombre_remitente", "El nombre del remitente", 100),
  requiredEmail("correo_remitente", "El correo del remitente"),
  requiredText("asunto", "El asunto", 100),
  requiredText("mensaje", "El mensaje"),
];

const postulacionValidation = [
  body("id_vacante")
    .isInt({ min: 1 })
    .withMessage("El ID de la vacante debe ser un entero positivo."),
  requiredText("nombre_candidato", "El nombre del candidato", 100),
  requiredEmail("correo_candidato", "El correo del candidato"),
  requiredText("telefono_candidato", "El teléfono del candidato", 15),
  requiredText("experiencia", "La experiencia"),
];

router.post(
  "/cotizaciones",
  requireObjectBody,
  ...cotizacionValidation,
  validateRequest,
  publicController.crearCotizacion,
);
router.post(
  "/contacto",
  requireObjectBody,
  ...contactoValidation,
  validateRequest,
  publicController.crearMensaje,
);
router.post(
  "/postular",
  requireObjectBody,
  ...postulacionValidation,
  validateRequest,
  publicController.crearPostulacion,
);
router.get("/vacantes", publicController.getVacantes);

module.exports = router;
