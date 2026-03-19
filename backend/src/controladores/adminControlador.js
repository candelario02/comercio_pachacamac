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
//listar solo a pagos a cobrar
const obtenerPagosPendientes = async (req, res) => {
    try {
      
        const query = "SELECT * FROM vista_pagos_a_cobrar"; 
        const { rows } = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        res.status(500).json({ success: false, mensaje: "Error" });
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
    const { id } = req.params;
    const { monto_confirmado } = req.body;

    try {
        await pool.query('BEGIN');

        // 1. Obtenemos datos
        const resInfo = await pool.query(
            `SELECT c.id, c.usuario_id, c.exento_pago, a.costo 
             FROM comerciantes c 
             JOIN actividades a ON c.actividad_id = a.id 
             WHERE c.id = $1`, [id]
        );

        if (resInfo.rows.length === 0) throw new Error("Comerciante no encontrado");
        const comerciante = resInfo.rows[0];
        const montoFinal = parseFloat(monto_confirmado) || parseFloat(comerciante.costo) || 0;

        // --- SOLUCIÓN AL ERROR DE LA BD ---
        // Obtenemos el mes actual en español para cumplir con el NOT NULL de la tabla
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const mesActual = meses[new Date().getMonth()];

        if (comerciante.exento_pago) {
            // Si es exonerado, lo formalizamos de una vez
            await pool.query("UPDATE comerciantes SET estado_tramite = 'formalizado' WHERE id = $1", [id]);
            
            // Insertamos el registro de pago como 'exonerado' para que aparezca en reportes
            await pool.query(
                `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, estado, mes_correspondiente, numero_operacion) 
                 VALUES ($1, 0, 'pagado', $2, 'EXONERADO')`,
                [id, mesActual]
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, mensaje, tipo) 
                 VALUES ($1, 'Tu trámite ha sido formalizado por exoneración de pago.', 'exito')`,
                [comerciante.usuario_id]
            );
        } else {
            // Si debe pagar, pasa a 'aprobado'
            await pool.query("UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1", [id]);

            const numeroOperacion = `OP-${Date.now().toString().slice(-8)}`;
            
            // REVISIÓN CRÍTICA: Añadimos 'mes_correspondiente'
            await pool.query(
                `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, estado, mes_correspondiente) 
                 VALUES ($1, $2, $3, 'pendiente', $4)`,
                [id, montoFinal, numeroOperacion, mesActual] // <--- Ahora sí enviamos el mes
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, mensaje, tipo) 
                 VALUES ($1, $2, 'pago')`,
                [comerciante.usuario_id, `Orden de pago generada por S/ ${montoFinal.toFixed(2)}. Sube tu voucher.`]
            );
        }

        await pool.query('COMMIT');
        res.json({ success: true, mensaje: "Trámite procesado correctamente" });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error en aprobación:", error);
        res.status(500).json({ success: false, mensaje: "Error DB: " + error.message });
    }
};

// --- Confirmar pago final ---
const confirmarPagoYFinalizar = async (req, res) => {
    const { id } = req.params; // ID del pago
    try {
        await pool.query('BEGIN');

        // 1. Confirmamos el pago y obtenemos al comerciante
        const resPago = await pool.query(
            `UPDATE pagos_municipales SET estado = 'confirmado' 
             WHERE id = $1 RETURNING comerciante_id`, [id]
        );
        
        const comercianteId = resPago.rows[0].comerciante_id;

        // 2. PASO FINAL: El comerciante ahora es FORMALIZADO
        const resCom = await pool.query(
            `UPDATE comerciantes SET estado_tramite = 'formalizado' 
             WHERE id = $1 RETURNING usuario_id`, [comercianteId]
        );

        // 3. Notificamos que ya puede descargar carnets
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, mensaje, tipo) 
             VALUES ($1, '¡Pago verificado! Ya puedes descargar tus carnets desde tu portal.', 'formalizado')`,
            [resCom.rows[0].usuario_id]
        );

        await pool.query('COMMIT');
        res.json({ success: true, mensaje: "Comerciante formalizado con éxito" });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

const obtenerFormalizados = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM vista_formalizados");
        res.json({ success: true, data: rows });
    } catch (error) {
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
    obtenerPagosPendientes, 
    aprobarTramiteYGenerarDeuda, 
    confirmarPagoYFinalizar, 
    obtenerFormalizados, 
    actualizarEstado, 
    gestionarActividad, 
    listarActividades, 
    gestionarRubro, 
    obtenerRubros 
};