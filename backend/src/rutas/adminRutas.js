const express = require('express');
const router = express.Router();
const { verificarAdmin } = require('../intermediarios/authIntermediario');
const adminControlador = require('../controladores/adminControlador');



router.get('/estadisticas', verificarAdmin, adminControlador.obtenerEstadisticas);
router.get('/solicitudes-pendientes', verificarAdmin, adminControlador.obtenerSolicitudesPendientes);
router.put('/solicitudes/:id/estado', verificarAdmin, adminControlador.actualizarEstado);
router.get('/pagos-pendientes', verificarAdmin, adminControlador.listarPagosPendientes);
router.put('/confirmar-pago/:id', verificarAdmin, adminControlador.confirmarPagoYFinalizar);
router.get('/formalizados', verificarAdmin, adminControlador.obtenerFormalizados);
router.get('/formalizados/exportar', verificarAdmin, adminControlador.exportarExcelFormalizados);

router.put('/aprobar-tramite/:id', verificarAdmin, adminControlador.aprobarTramiteYGenerarDeuda);

router.get('/actividades', verificarAdmin, adminControlador.listarActividades);
router.post('/gestionar-actividad', verificarAdmin, adminControlador.gestionarActividad);


router.get('/rubros', verificarAdmin, adminControlador.obtenerRubros); 
router.post('/gestionar-rubro', verificarAdmin, adminControlador.gestionarRubro);


module.exports = router;            