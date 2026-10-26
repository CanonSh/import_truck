const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
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

module.exports = router;
