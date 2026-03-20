const express = require('express');
const router = express.Router();
const comercianteCtrl = require('../controladores/comercianteControlador'); 
const { verificarComerciante } = require('../intermediarios/authIntermediario');

// 1. Configuración de Cloudinary
const { storage } = require('../configuracion/cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

// --- RUTAS ---

router.get('/perfil', verificarComerciante, comercianteCtrl.obtenerPerfilPortal);
router.get('/notificaciones', verificarComerciante, comercianteCtrl.obtenerNotificaciones);

// 2. LA RUTA DE PAGO (Solo una vez y con los 3 pasos correctos)
router.post(
    '/registrar-pago', 
    verificarComerciante,      // Paso 1: Verifica quién es el usuario
    upload.single('voucher'),  // Paso 2: Sube la foto a Cloudinary
    comercianteCtrl.registrarPago // Paso 3: Guarda el link en la base de datos
);

module.exports = router;