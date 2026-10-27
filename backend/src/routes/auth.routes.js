const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
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
