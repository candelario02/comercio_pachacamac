const express = require('express');
const router = express.Router();
const comercianteCtrl = require('../controladores/comercianteControlador'); 
const { verificarComerciante } = require('../intermediarios/authIntermediario');

// 1. Configuración de Cloudinary
const { storage } = require('../configuracion/cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

router.get('/perfil', verificarComerciante, comercianteCtrl.obtenerPerfilPortal);
router.get('/notificaciones', verificarComerciante, comercianteCtrl.obtenerNotificaciones);

router.post(
    '/registrar-pago', 
    verificarComerciante,      
    upload.single('voucher'),  
    comercianteCtrl.registrarPago 
);

module.exports = router;