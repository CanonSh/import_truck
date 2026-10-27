const fs = require("fs/promises");
const { body, query, validationResult } = require("express-validator");
const { requiredText, positiveId } = require("./validation.middleware");

const vehicleFieldsValidation = [
  requiredText("tipo_vehiculo", "El tipo de vehículo", 100),
  requiredText("marca", "La marca", 100),
  requiredText("modelo", "El modelo", 100),
  body("anio")
    .custom(value => typeof value === "string" || typeof value === "number")
    .withMessage("El año debe ser escalar.").bail()
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
    .withMessage("El año debe ser un entero válido."),
  body("precio")
    .custom(value => typeof value === "string" || typeof value === "number")
    .withMessage("El precio debe ser escalar.").bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("El precio debe ser un número con hasta dos decimales.")
    .bail()
    .custom((value) => Number(value) >= 0 && Number(value) <= 99999999.99)
    .withMessage("El precio excede el límite de la base de datos."),
  body("caracteristicas")
    .optional({ values: "null" })
    .customSanitizer(value => value === "" ? null : value)
    .isString()
    .withMessage("Las características deben ser texto.")
    .bail().isLength({ max: 16000 }).withMessage("Las características son demasiado extensas."),
  body("imagen_url")
    .optional({ values: "null" })
    .customSanitizer(value => value === "" ? null : value)
    .isString()
    .withMessage("La URL de imagen debe ser texto.")
    .bail()
    .isLength({ max: 255 })
    .withMessage("La URL de imagen no puede superar 255 caracteres.")
    .bail().custom(value => /^\/uploads\/[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) ||
      /^https?:\/\//i.test(value) && Boolean(new URL(value).hostname))
    .withMessage("La URL de imagen debe ser HTTP(S) o una imagen de uploads."),
  body("estado")
    .optional({ values: "null" })
    .customSanitizer(value => value === "" ? null : value)
    .isString().withMessage("El estado debe ser texto.").bail()
    .isIn(["Disponible", "Vendido", "Reservado"])
    .withMessage("El estado del vehículo no es válido."),
];

const vehicleIdValidation = positiveId("id");
const vehicleQueryValidation = [
  query("marca").optional({ values: "falsy" }).isString().bail().isLength({ min: 1, max: 100 }),
  query("busqueda").optional({ values: "falsy" }).isString().bail().isLength({ min: 1, max: 100 }),
  query("anio").optional({ values: "falsy" }).isString().bail().isInt({ min: 1886, max: new Date().getFullYear() + 1 }),
];

const validateVehicleRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({
      error: "Solicitud inválida",
      detalles: errors
        .array()
        .map(({ path, msg }) => ({ campo: path, mensaje: msg })),
    });
  }

  next();
};

module.exports = {
  vehicleFieldsValidation,
  vehicleIdValidation,
  vehicleQueryValidation,
  validateVehicleRequest,
};
