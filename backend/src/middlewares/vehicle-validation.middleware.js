const fs = require("fs/promises");
const { body, param, validationResult } = require("express-validator");
const { requiredText, requiredEmail } = require("./validation.middleware");

const vehicleFieldsValidation = [
  requiredText("tipo_vehiculo", "El tipo de vehículo", 100),
  requiredText("marca", "La marca", 100),
  requiredText("modelo", "El modelo", 100),
  body("anio")
    .isInt({ min: -2147483648, max: 2147483647 })
    .withMessage("El año debe ser un entero válido."),
  body("precio")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("El precio debe ser un número con hasta dos decimales.")
    .bail()
    .custom((value) => Math.abs(Number(value)) <= 99999999.99)
    .withMessage("El precio excede el límite de la base de datos."),
  body("caracteristicas")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Las características deben ser texto."),
  body("imagen_url")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("La URL de imagen debe ser texto.")
    .bail()
    .isLength({ max: 255 })
    .withMessage("La URL de imagen no puede superar 255 caracteres."),
  body("estado")
    .optional({ values: "falsy" })
    .isIn(["Disponible", "Vendido", "Reservado"])
    .withMessage("El estado del vehículo no es válido."),
];

const vehicleIdValidation = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID del vehículo debe ser un entero positivo.");

const validateVehicleRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.path) fs.unlink(req.file.path).catch(() => {});
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
  validateVehicleRequest,
};
