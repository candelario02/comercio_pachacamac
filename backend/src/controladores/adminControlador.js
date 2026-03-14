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

// --- APROBACIÓN PROFESIONAL: Aprueba, calcula costo y genera deuda ---
const aprobarTramiteYGenerarDeuda = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('BEGIN');

        // 1. Obtener datos del comerciante y su actividad
        const queryInfo = `
            SELECT c.id, c.exento_pago, a.costo 
            FROM comerciantes c 
            JOIN actividades a ON c.actividad_id = a.id 
            WHERE c.id = $1`;
        const resInfo = await pool.query(queryInfo, [id]);

        if (resInfo.rows.length === 0) throw new Error("Comerciante no encontrado");
        
        const comerciante = resInfo.rows[0];
        const monto = parseFloat(comerciante.costo) || 0;

        // 2. Lógica Profesional: ¿Es exonerado?
        if (comerciante.exento_pago) {
            // A. Si es exento, formalizamos directo (no creamos deuda)
            await pool.query(
                "UPDATE comerciantes SET estado_tramite = 'formalizado' WHERE id = $1", 
                [id]
            );
            await pool.query('COMMIT');
            return res.json({ success: true, mensaje: "Trámite aprobado y formalizado por exoneración." });
        } else {
            // B. Si NO es exento, flujo normal de deuda
            await pool.query(
                "UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1", 
                [id]
            );

            const numeroOperacion = `OP-${Date.now().toString().slice(-8)}`;
            const mesActual = new Date().toLocaleString('es-ES', { month: 'long' });

            await pool.query(
                `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, estado) 
                 VALUES ($1, $2, $3, $4, 'pendiente')`,
                [id, monto, numeroOperacion, mesActual]
            );

            await pool.query('COMMIT');
            return res.json({ 
                success: true, 
                mensaje: `Trámite aprobado. Orden de pago generada (S/ ${monto.toFixed(2)})` 
            });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error en Transacción de Aprobación:", error);
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

// --- Confirmar pago final ---
const confirmarPagoYFinalizar = async (req, res) => {
    const { id } = req.params; 
    try {
        await pool.query('BEGIN');
        const resPago = await pool.query("UPDATE pagos_municipales SET estado = 'confirmado' WHERE id = $1", [id]);
        if (resPago.rowCount === 0) throw new Error("Pago no encontrado");

        await pool.query(
            "UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = (SELECT comerciante_id FROM pagos_municipales WHERE id = $1)", 
            [id]
        );
        
        await pool.query('COMMIT');
        res.json({ success: true, mensaje: "Pago confirmado y trámite formalizado." });
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