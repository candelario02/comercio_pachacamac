// backend/src/servicios/solicitudServicio.js
const db = require('../configuracion/db');

const crearSolicitudComerciante = async (data) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Verificar actividad
        const actividadRes = await client.query(
            'SELECT requiere_carnet_sanidad FROM actividades WHERE id = $1',
            [data.actividad_id]
        );

        if (!actividadRes.rows[0]) throw new Error("Actividad no encontrada");
        const requiereCarnet = actividadRes.rows[0].requiere_carnet_sanidad;

        // Validación: si requiere y NO tiene archivo, DEBE marcar el check
        if (requiereCarnet && !data.archivo && !data.desea_tramitar_carnet) {
            throw new Error("Esta actividad requiere carnet de sanidad. Debes subirlo o solicitar el trámite.");
        }

        // 2. Crear usuario
        const userRes = await client.query(
            `INSERT INTO usuarios (correo_electronico, contrasena, rol_id) 
             VALUES ($1, $2, $3) RETURNING id`,
            [data.correo_electronico, data.hashedPassword, 2]
        );

        const usuarioId = userRes.rows[0].id;

const solicitudes = await client.query(`
    SELECT 
        c.comerciante_id, 
        c.dni, 
        c.nombres, 
        c.apellidos, 
        c.numero_celular AS celular,    
        c.latitud_puesto AS lat,   
        c.longitud_puesto AS lng, 
        c.distrito,
        c.estado_tramite
    FROM comerciantes c
    WHERE c.estado_tramite = 'pendiente'
`);

res.json(solicitudes.rows);

        const comercianteId = comercianteRes.rows[0].id;

        // 4. Guardar carnet solo si lo subió
        if (requiereCarnet && data.archivo) {
            await client.query(
                `INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube)
                 VALUES ($1, $2, $3)`,
                [comercianteId, 'CARNET_SANIDAD', data.archivo.path]
            );
        }

        await client.query('COMMIT');
        return { success: true, comercianteId };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { crearSolicitudComerciante };