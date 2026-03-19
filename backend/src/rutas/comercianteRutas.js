const express = require('express');
const router = express.Router();
const comercianteCtrl = require('../controladores/comercianteControlador'); // El que creamos antes
const { verificarComerciante } = require('../intermediarios/authIntermediario');

// Estas son las rutas que alimentarán tu PortalComerciante.jsx
router.get('/perfil', verificarComerciante, comercianteCtrl.obtenerPerfilPortal);
router.get('/notificaciones', verificarComerciante, comercianteCtrl.obtenerNotificaciones);
router.post('/registrar-pago', verificarComerciante, comercianteCtrl.registrarPago);

module.exports = router;