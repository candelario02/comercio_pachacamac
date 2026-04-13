const db = require("../configuracion/db");

const crearSolicitudComerciante = async (data) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const checkUser = await client.query(
      "SELECT id FROM usuarios WHERE correo_electronico = $1",
      [data.correo_electronico],
    );

    const usuarioExistente = checkUser.rows[0];
    let usuarioId;

    if (!usuarioExistente) {
      const userRes = await client.query(
        `INSERT INTO usuarios (correo_electronico, contrasena, rol_id) 
                 VALUES ($1, $2, $3) RETURNING id`,
        [data.correo_electronico, data.hashedPassword, 2],
      );
      usuarioId = userRes.rows[0].id;
    } else {
      usuarioId = usuarioExistente.id;
    }

    const checkComerciante = await client.query(
      "SELECT id FROM comerciantes WHERE usuario_id = $1",
      [usuarioId],
    );
    const comercianteExistente = checkComerciante.rows[0];
    let comercianteId;

    if (!comercianteExistente) {
      const comercianteRes = await client.query(
        `INSERT INTO comerciantes (
                    usuario_id, dni, nombres, apellidos, numero_celular, 
                    actividad_id, sector_id, latitud_puesto, longitud_puesto, 
                    desea_tramitar_carnet, estado_tramite
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          usuarioId,
          data.dni,
          data.nombres,
          data.apellidos,
          data.celular,
          data.actividad_id,
          data.sector_id,
          data.lat,
          data.lng,
          data.desea_tramitar_carnet || false,
          "pendiente",
        ],
      );
      comercianteId = comercianteRes.rows[0].id;
    } else {
      comercianteId = comercianteExistente.id;
      await client.query(
        `UPDATE comerciantes SET 
                    actividad_id = $1, sector_id = $2, latitud_puesto = $3, 
                    longitud_puesto = $4, desea_tramitar_carnet = $5, estado_tramite = 'pendiente'
                 WHERE id = $6`,
        [
          data.actividad_id,
          data.sector_id,
          data.lat,
          data.lng,
          data.desea_tramitar_carnet || false,
          comercianteId,
        ],
      );
    }
    if (data.archivos && data.archivos.archivo_carnet) {
      await client.query(
        `INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube)
                 VALUES ($1, $2, $3)`,
        [comercianteId, "CARNET_SANIDAD", data.archivos.archivo_carnet[0].path],
      );
    }
    if (data.archivos && data.archivos.archivo_puesto) {
      await client.query(
        `INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube)
                 VALUES ($1, $2, $3)`,
        [comercianteId, "FOTO_PUESTO", data.archivos.archivo_puesto[0].path],
      );
    }

    await client.query("COMMIT");
    return { success: true, comercianteId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en servicio:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { crearSolicitudComerciante };
