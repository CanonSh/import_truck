const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  requireObjectBody,
  requiredText,
  requiredEmail,
  validateRequest,
} = require("../middlewares/validation.middleware");

const loginValidation = [
  requiredEmail("correo", "El correo"),
  requiredText(
    "password",
    "La contraseña",
    undefined,
    "La contraseña es obligatoria.",
  ),
];

router.post(
  "/login",
  requireObjectBody,
  ...loginValidation,
  validateRequest,
  authController.login,
);

module.exports = router;
