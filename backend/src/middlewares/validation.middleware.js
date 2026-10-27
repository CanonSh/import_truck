const { body, validationResult } = require("express-validator");

const requireObjectBody = (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Solicitud inválida",
      detalles: [
        { campo: "body", mensaje: "El cuerpo debe ser un objeto JSON." },
      ],
    });
  }

  next();
};

const requiredText = (
  field,
  label,
  maxLength,
  requiredMessage = `${label} es obligatorio.`,
) => {
  const validator = body(field)
    .isString()
    .withMessage(`${label} debe ser texto.`)
    .bail()
    .custom((value) => value.trim().length > 0)
    .withMessage(requiredMessage)
    .bail();

  if (maxLength) {
    validator
      .isLength({ max: maxLength })
      .withMessage(`${label} no puede superar ${maxLength} caracteres.`);
  }

  return validator;
};

const requiredEmail = (field, label) =>
  requiredText(field, label, 100)
    .bail()
    .isEmail()
    .withMessage(`${label} debe ser un correo electrónico válido.`);

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
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
  requireObjectBody,
  requiredText,
  requiredEmail,
  validateRequest,
};
