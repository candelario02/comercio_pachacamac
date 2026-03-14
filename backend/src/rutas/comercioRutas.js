const express = require('express');
const router = express.Router();
const { verificarComerciante } = require('../intermediarios/authIntermediario');
const comercioControlador = require('../controladores/comercioControlador');

router.post('/registrar-pago', verificarComerciante, comercioControlador.registrarPago);

module.exports = router;