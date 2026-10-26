const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.post('/cotizaciones', publicController.crearCotizacion);
router.post('/contacto', publicController.crearMensaje);
router.get('/vacantes', publicController.getVacantes);

module.exports = router;