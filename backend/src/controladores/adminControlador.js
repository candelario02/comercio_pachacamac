const pool = require('../configuracion/db');

// --- Obtener datos para el dashboard ---
const obtenerEstadisticas = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*)::INT AS total,
                COUNT(*) FILTER (WHERE estado_tramite = 'pendiente')::INT AS pendientes,
                COUNT(*) FILTER (WHERE estado_tramite = 'aprobado')::INT AS formalizados
            FROM comerciantes WHERE eliminado = false;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ success: false, mensaje: "Error al cargar indicadores" });
    }
};

// --- Solicitudes Pendientes ---
const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const query = "SELECT * FROM vista_solicitudes_pendientes WHERE estado_tramite = 'pendiente'";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error" });
    }
};

// --- Actualizar estado (Cambios manuales de admin) ---
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_tramite, observaciones_admin } = req.body;
        const estadoNormalizado = estado_tramite ? estado_tramite.toLowerCase() : 'pendiente';
        const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado', 'observado'];
        
        if (!estadosPermitidos.includes(estadoNormalizado)) {
            return res.status(400).json({ success: false, mensaje: "Estado no válido" });
        }

        const query = `UPDATE comerciantes SET estado_tramite = $1, observaciones_admin = $2 WHERE id = $3`;
        await pool.query(query, [estadoNormalizado, observaciones_admin, id]);
        res.json({ success: true, mensaje: "Actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error interno" });
    }
};


// --- Listar pagos pendientes ---
const listarPagosPendientes = async (req, res) => {
    try {
        const query = "SELECT * FROM vista_pagos_pendientes ORDER BY fecha_pago DESC";
        const result = await pool.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        res.status(500).json({ success: false, mensaje: "Error al consultar pagos" });
    }
};

const aprobarTramiteYGenerarDeuda = async (req, res) => {
    const { id } = req.params; // UUID del comerciante
    const { monto_confirmado } = req.body;
    const adminId = req.usuario.id; // Asumiendo que obtienes el ID del admin del token

    try {
        await pool.query('BEGIN');

        // 1. Obtener info del comerciante y su actividad
        const resInfo = await pool.query(
            `SELECT c.id, c.usuario_id, c.exento_pago, a.costo, a.descripcion as actividad_nombre
             FROM comerciantes c 
             JOIN actividades a ON c.actividad_id = a.id 
             WHERE c.id = $1`, [id]
        );

        if (resInfo.rows.length === 0) throw new Error("Comerciante no encontrado");
        const comerciante = resInfo.rows[0];
        
        // Calculamos el monto: si el admin no envió uno, usamos el de la actividad
        const montoFinal = parseFloat(monto_confirmado) || parseFloat(comerciante.costo) || 0;

        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const mesActual = meses[new Date().getMonth()];
        const numeroOP = `OP-${Date.now().toString().slice(-8)}`;

        // 2. CREAR LA ORDEN DE PAGO (Primero)
        // Esto es lo más profesional: dejar registro de quién creó la orden y el detalle
        const resOrden = await pool.query(
            `INSERT INTO ordenes_pago (comerciante_id, monto_total, detalle, estado, creado_por) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [id, montoFinal, JSON.stringify({ actividad: comerciante.actividad_nombre, mes: mesActual }), 
             comerciante.exento_pago ? 'pagado' : 'pendiente', adminId]
        );
        const ordenId = resOrden.rows[0].id;

        if (comerciante.exento_pago) {
            // REGLA: Si tu BD aún no acepta 'formalizado', cámbialo a 'aprobado' o actualiza el CHECK en la BD
            await pool.query("UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1", [id]);
            
            // Insertar pago con monto 0 vinculado a la orden
            await pool.query(
                `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, estado, orden_pago_id) 
                 VALUES ($1, 0, $2, $3, 'pagado', $4)`,
                [id, `EXO-${ordenId}`, mesActual, ordenId]
            );

        } else {
            // Flujo normal: Esperando pago
            await pool.query("UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1", [id]);

            // Generar la deuda vinculada a la orden
            await pool.query(
                `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, estado, orden_pago_id) 
                 VALUES ($1, $2, $3, $4, 'pendiente', $5)`,
                [id, montoFinal, numeroOP, mesActual, ordenId]
            );
        }

        // 3. Notificación al usuario
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) 
             VALUES ($1, $2, $3, $4)`,
            [comerciante.usuario_id, 
             comerciante.exento_pago ? 'Trámite Formalizado' : 'Orden de Pago Lista',
             comerciante.exento_pago ? 'Tu trámite ha sido formalizado con éxito.' : `Se ha generado tu orden por S/ ${montoFinal.toFixed(2)}.`,
             comerciante.exento_pago ? 'exito' : 'pago']
        );

        await pool.query('COMMIT');
        res.json({ success: true, mensaje: "Circuito de orden y pago completado", ordenId });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error profesional en BD:", error);
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

/// --- Confirmar pago final y Formalizar ---
const confirmarPagoYFinalizar = async (req, res) => {
    const { id } = req.params; // ID del pago (pagos_municipales.id)
    const { vigencia_comercio, vigencia_sanidad } = req.body; // Los meses que el admin digitó

    try {
        await pool.query('BEGIN');

        // 1. Confirmamos el pago y obtenemos el comerciante_id
        const resPago = await pool.query(
            `UPDATE pagos_municipales 
             SET estado = 'pagado' 
             WHERE id = $1 
             RETURNING comerciante_id, orden_pago_id`, [id]
        );

        if (resPago.rows.length === 0) throw new Error("Pago no encontrado");
        const { comerciante_id, orden_pago_id } = resPago.rows[0];

        // 2. Actualizamos la ORDEN DE PAGO a 'pagado'
        if (orden_pago_id) {
            await pool.query(
                `UPDATE ordenes_pago SET estado = 'pagado' WHERE id = $1`, 
                [orden_pago_id]
            );
        }

        // 3. PASO CRÍTICO: El comerciante ahora es FORMALIZADO
        // Asegúrate de haber corrido el SQL del ALTER TABLE para aceptar 'formalizado'
        const resCom = await pool.query(
            `UPDATE comerciantes 
             SET estado_tramite = 'formalizado' 
             WHERE id = $1 
             RETURNING usuario_id, desea_tramitar_carnet`, [comerciante_id]
        );
        const { usuario_id, desea_tramitar_carnet } = resCom.rows[0];

        // 4. GENERACIÓN DE VIGENCIA (Control Total)
        // Calculamos las fechas basadas en lo que el admin digitó
        const mesesFinalesComercio = parseInt(vigencia_comercio) || 12; // default 1 año
        const mesesFinalesSanidad = desea_tramitar_carnet ? (parseInt(vigencia_sanidad) || 6) : 0;

        // Insertamos o Actualizamos la tabla 'autorizaciones'
        // Usamos un QR único (puedes usar el UUID del comerciante o un hash)
        const qrUnico = `QR-${comerciante_id.slice(0, 8)}-${Date.now()}`;

        await pool.query(
            `INSERT INTO autorizaciones (comerciante_id, fecha_emision, fecha_vencimiento, codigo_qr_unico)
             VALUES ($1, CURRENT_DATE, CURRENT_DATE + ($2 || ' months')::interval, $3)
             ON CONFLICT (comerciante_id) DO UPDATE 
             SET fecha_emision = CURRENT_DATE, 
                 fecha_vencimiento = CURRENT_DATE + ($2 || ' months')::interval,
                 codigo_qr_unico = $3`,
            [comerciante_id, mesesFinalesComercio, qrUnico]
        );

        // 5. Notificación Final
        await pool.query(
    `INSERT INTO notificaciones (usuario_id, mensaje, tipo) 
     VALUES ($1, $2, $3)`,
    [usuario_id, `¡Felicidades! Tu pago ha sido verificado.`, 'exito']
);

        await pool.query('COMMIT');
        res.json({ 
            success: true, 
            mensaje: "Comerciante formalizado y carnets generados con éxito",
            vigencia: mesesFinalesComercio
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error en formalización:", error);
        res.status(500).json({ success: false, mensaje: "Error al formalizar: " + error.message });
    }
};

const obtenerFormalizados = async (req, res) => {
    try {
        const { buscar } = req.query; 
        
        let consulta = "SELECT * FROM vista_formalizados";
        let parametros = [];

        if (buscar && buscar.trim() !== "") {
            consulta += " WHERE dni LIKE $1";
            parametros.push(`%${buscar.trim()}%`); 
        }

        consulta += " ORDER BY fecha_vencimiento ASC";

        const { rows } = await pool.query(consulta, parametros);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error en obtenerFormalizados:", error);
        res.status(500).json({ success: false, mensaje: "Error al cargar formalizados" });
    }
};

const gestionarActividad = async (req, res) => {
    const { accion, id, rubro_id, codigo, descripcion, requiere_sanidad } = req.body;
    try {
        await pool.query(`CALL sp_gestionar_actividad($1, $2, $3, $4, $5, $6, NULL)`, 
        [accion, id || null, rubro_id || null, codigo || null, descripcion || null, requiere_sanidad || false]);
        res.json({ success: true, mensaje: `Operación ${accion} realizada.` });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error en el servidor." });
    }
};

const listarActividades = async (req, res) => {
    try {
        const result = await pool.query(`SELECT a.*, r.nombre as nombre_rubro FROM actividades a JOIN rubros r ON a.rubro_id = r.id ORDER BY a.id DESC;`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al obtener la lista." });
    }
};

const gestionarRubro = async (req, res) => {
    const { accion, id, nombre, descripcion } = req.body;
    try {
        await pool.query(`CALL sp_gestionar_rubro($1, $2, $3, $4, $5)`, [accion, id || null, nombre || null, descripcion || null, false]);
        res.status(200).json({ mensaje: "Operación realizada con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
};

const obtenerRubros = async (req, res) => {
    try {
        const resultado = await pool.query("SELECT id, nombre, descripcion FROM rubros ORDER BY id ASC");
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la lista." });
    }
};

module.exports = { 
    obtenerEstadisticas, 
    obtenerSolicitudesPendientes, 
    listarPagosPendientes, 
    aprobarTramiteYGenerarDeuda, 
    confirmarPagoYFinalizar, 
    obtenerFormalizados, 
    actualizarEstado, 
    gestionarActividad, 
    listarActividades, 
    gestionarRubro, 
    obtenerRubros 
};