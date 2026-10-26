const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas protegidas
router.get('/cotizaciones', verifyToken, adminController.getCotizaciones);
router.get('/cotizaciones/:id', verifyToken, adminController.getCotizacionById);
router.get('/mensajes', verifyToken, adminController.getMensajes);
router.get('/solicitudes', verifyToken, adminController.getSolicitudes);

module.exports = router;