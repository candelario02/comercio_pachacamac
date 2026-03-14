const pool = require('../configuracion/db');

const registrarPago = async (req, res) => {
    // Obtenemos el ID del usuario desde el token
    const usuario_id_token = req.usuario.id; 
    const { monto_pagado, numero_operacion, mes_correspondiente } = req.body;

    try {
        // 1. Buscamos el ID del perfil de comerciante relacionado al usuario
        const consultaComerciante = `SELECT id FROM comerciantes WHERE usuario_id = $1`;
        const resComerciante = await pool.query(consultaComerciante, [usuario_id_token]);

        if (resComerciante.rows.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Perfil de comerciante no encontrado" });
        }

        const comerciante_id = resComerciante.rows[0].id;

        // 2. Insertamos el pago usando el ID del comerciante encontrado
        const query = `
            INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente)
            VALUES ($1, $2, $3, $4)
        `;
        
        await pool.query(query, [comerciante_id, monto_pagado, numero_operacion, mes_correspondiente]);
        
        res.status(201).json({ success: true, mensaje: "Pago registrado para revisión" });
        
    } catch (error) {
        console.error("Error en registrarPago:", error);
        res.status(500).json({ success: false, mensaje: "Error al registrar el pago" });
    }
};

module.exports = { registrarPago };