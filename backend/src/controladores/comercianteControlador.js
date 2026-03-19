const pool = require('../configuracion/db');

// --- 1. ESTA ES NUEVA: Alimenta el Stepper y los datos del Portal ---
const obtenerPerfilPortal = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; // Viene de tu verificarToken

        const query = `
            SELECT 
                c.id, c.nombres, c.apellidos, c.dni, c.estado_tramite,
                u.correo_electronico,
                -- Buscamos si tiene una orden de pago pendiente de la tabla que creamos
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

// --- 2. ESTA ES LA QUE TÚ ME ENVIASTE (Mejorada para ser pro) ---
const registrarPago = async (req, res) => {
    const usuario_id_token = req.usuario.id; 
    // Añadimos orden_id para que el admin sepa QUÉ está pagando el comerciante
    const { monto_pagado, numero_operacion, mes_correspondiente, orden_id } = req.body;

    try {
        await pool.query('BEGIN');

        // Buscamos el ID del comerciante (Tu lógica original)
        const resCom = await pool.query(`SELECT id FROM comerciantes WHERE usuario_id = $1`, [usuario_id_token]);
        if (resCom.rows.length === 0) throw new Error("Perfil no encontrado");
        const comerciante_id = resCom.rows[0].id;

        // Insertamos el pago vinculado a la orden generada por el admin
        const query = `
            INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, orden_pago_id, estado)
            VALUES ($1, $2, $3, $4, $5, 'revision')
        `;
        
        await pool.query(query, [comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, orden_id]);
        
        // Notificamos al sistema (para que aparezca en el dash del admin)
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje) 
             VALUES ((SELECT id FROM usuarios WHERE rol_id = 1 LIMIT 1), 'Nuevo Pago', 'El comerciante con DNI ' || (SELECT dni FROM comerciantes WHERE id = $1) || ' ha subido un voucher.')`,
            [comerciante_id]
        );

        await pool.query('COMMIT');
        res.status(201).json({ success: true, mensaje: "Pago registrado y enviado a revisión municipal" });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, mensaje: "Error al registrar el pago" });
    }
};

// --- 3. NUEVA: Para las notificaciones del portal ---
const obtenerNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const query = `SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 5`;
        const { rows } = await pool.query(query, [usuarioId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error" });
    }
};

module.exports = { obtenerPerfilPortal, registrarPago, obtenerNotificaciones };