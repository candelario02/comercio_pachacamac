
const db = require('../configuracion/db');

const crearSolicitudComerciante = async (data) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

     
        const actividadRes = await client.query(
            'SELECT requiere_carnet_sanidad FROM actividades WHERE id = $1',
            [data.actividad_id]
        );

        if (!actividadRes.rows[0]) throw new Error("Actividad no encontrada");
        const requiereCarnet = actividadRes.rows[0].requiere_carnet_sanidad;

       
        if (requiereCarnet && !data.archivo && !data.desea_tramitar_carnet) {
            throw new Error("Esta actividad requiere carnet de sanidad. Debes subirlo o solicitar el trámite.");
        }

     
        const userRes = await client.query(
            `INSERT INTO usuarios (correo_electronico, contrasena, rol_id) 
             VALUES ($1, $2, $3) RETURNING id`,
            [data.correo_electronico, data.hashedPassword, 2]
        );

        const usuarioId = userRes.rows[0].id;

const comercianteRes = await client.query(
    `INSERT INTO comerciantes (
        usuario_id, dni, nombres, apellidos, numero_celular, 
        actividad_id, sector_id, latitud_puesto, longitud_puesto, 
        desea_tramitar_carnet, estado_tramite
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id`,
    [
        usuarioId, data.dni, data.nombres, data.apellidos, data.celular,
        data.actividad_id, data.sector_id, data.lat, data.lng,
        data.desea_tramitar_carnet || false, 'pendiente'
    ]
);

const comercianteId = comercianteRes.rows[0].id;

if (requiereCarnet && data.archivo) {
    await client.query(
        `INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube)
         VALUES ($1, $2, $3)`,
        [
            comercianteId, 
            'CARNET_SANIDAD', 
            data.archivo.path 
        ] 
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