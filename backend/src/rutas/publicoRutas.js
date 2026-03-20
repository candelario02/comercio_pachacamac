const express = require('express');
const router = express.Router();
const publicoControlador = require('../controladores/publicoControlador');
const solicitudControlador = require('../controladores/solicitudControlador');


const multer = require('multer');
const { storage } = require('../configuracion/cloudinary'); 
const upload = multer({ storage: storage });

router.get('/rubros', publicoControlador.listarRubros);
router.get('/actividades', publicoControlador.listarActividades);
router.get('/info-completa', publicoControlador.listarInfoPublicaRubrosActividad);
router.get('/sectores', publicoControlador.listarSectores);


router.post('/solicitar-licencia', upload.single('archivo_carnet'), solicitudControlador.registrarSolicitud);

module.exports = router;