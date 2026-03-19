const express = require('express');
const router = express.Router();
const comercianteCtrl = require('../controladores/comercianteControlador'); 
const { verificarComerciante } = require('../intermediarios/authIntermediario');

const subirArchivo = require('../intermediarios/uploadCarnet');

router.get('/perfil', verificarComerciante, comercianteCtrl.obtenerPerfilPortal);


router.get('/notificaciones', verificarComerciante, comercianteCtrl.obtenerNotificaciones);


router.post(
    '/registrar-pago', 
    verificarComerciante, 
    subirArchivo.single('voucher'), 
    comercianteCtrl.registrarPago
);

module.exports = router;