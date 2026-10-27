const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");
const { rateLimit } = require("express-rate-limit");
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
  body("password").custom(value => typeof value === "string" && Buffer.byteLength(value) <= 72)
    .withMessage("La contraseña no puede superar 72 bytes."),
];

router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false,
    message: { error: "Demasiados intentos. Intenta más tarde." } }),
  requireObjectBody,
  ...loginValidation,
  validateRequest,
  authController.login,
);

module.exports = router;
