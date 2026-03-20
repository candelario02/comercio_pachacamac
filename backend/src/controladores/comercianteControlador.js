const pool = require('../configuracion/db');

// para su perfil comerciante
const obtenerPerfilPortal = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; 
        const query = `
            SELECT 
                c.id, c.nombres, c.apellidos, c.dni, c.estado_tramite,
                u.correo_electronico,
                (SELECT monto_total FROM ordenes_pago WHERE comerciante_id = c.id AND estado = 'pendiente' LIMIT 1) as monto_pendiente,
                (SELECT id FROM ordenes_pago WHERE comerciante_id = c.id AND estado = 'pendiente' LIMIT 1) as orden_id
            FROM comerciantes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE u.id = $1 AND c.eliminado = false
        `;
        const { rows } = await pool.query(query, [usuarioId]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "Perfil no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al obtener perfil" });
    }
};

const registrarPago = async (req, res) => {
    const usuario_id_token = req.usuario.id; 
    const { monto_pagado, numero_operacion, mes_correspondiente, orden_id } = req.body;
    
    const voucher_url = req.file ? req.file.filename : null;

    if (!voucher_url) {
        return res.status(400).json({ success: false, mensaje: "Debes subir la foto del voucher" });
    }

    try {
        await pool.query('BEGIN');
        const resCom = await pool.query(`SELECT id FROM comerciantes WHERE usuario_id = $1`, [usuario_id_token]);
        if (resCom.rows.length === 0) throw new Error("Perfil no encontrado");
        const comerciante_id = resCom.rows[0].id;
        const pagoPrevio = await pool.query(
            `SELECT id FROM pagos_municipales WHERE orden_pago_id = $1`, 
            [orden_id]
        );

        if (pagoPrevio.rows.length > 0) {
            const updateQuery = `
                UPDATE pagos_municipales 
                SET monto_pagado = $1, 
                    numero_operacion = $2, 
                    voucher_url = $3, 
                    estado = 'revision', 
                    fecha_pago = NOW()
                WHERE id = $4
            `;
            await pool.query(updateQuery, [monto_pagado, numero_operacion, voucher_url, pagoPrevio.rows[0].id]);
        } else {
            const insertQuery = `
                INSERT INTO pagos_municipales (
                    comerciante_id, monto_pagado, numero_operacion, 
                    mes_correspondiente, orden_pago_id, estado, voucher_url
                ) VALUES ($1, $2, $3, $4, $5, 'revision', $6)
            `;
            await pool.query(insertQuery, [comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, orden_id, voucher_url]);
        }

        await pool.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje) 
             VALUES ((SELECT id FROM usuarios WHERE rol_id = 1 LIMIT 1), 'Nuevo Pago', 'Se ha recibido un comprobante para la Orden #${orden_id}')`
        );

        await pool.query('COMMIT');
        res.status(201).json({ success: true, mensaje: "Pago enviado a revisión correctamente" });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("DETALLE DEL ERROR:", error);
        res.status(500).json({ success: false, mensaje: "Error interno al registrar pago" });
    }
};

const obtenerNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const query = `SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 10`;
        const { rows } = await pool.query(query, [usuarioId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error" });
    }
};

module.exports = { obtenerPerfilPortal, registrarPago, obtenerNotificaciones };