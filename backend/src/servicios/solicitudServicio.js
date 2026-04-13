const db = require("../configuracion/db");

const crearSolicitudComerciante = async (data) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const correoLimpio = data.correo_electronico.trim().toLowerCase();

    const checkUser = await client.query(
      "SELECT id FROM usuarios WHERE correo_electronico = $1",
      [correoLimpio],
    );

    const usuarioExistente = checkUser.rows[0];
    let usuarioId;

    if (!usuarioExistente) {
      if (!data.hashedPassword) throw new Error("Contraseña requerida.");

      const userRes = await client.query(
        `INSERT INTO usuarios (correo_electronico, contrasena, rol_id) VALUES ($1, $2, $3) RETURNING id`,
        [correoLimpio, data.hashedPassword, 2],
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
        numero_celular = $1, actividad_id = $2, sector_id = $3, 
        latitud_puesto = $4, longitud_puesto = $5, desea_tramitar_carnet = $6,
        estado_tramite = 'pendiente'
     WHERE id = $7`,
        [
          data.celular,
          data.actividad_id,
          data.sector_id,
          data.lat,
          data.lng,
          data.desea_tramitar_carnet || false,
          comercianteId,
        ],
      );
    }
    const guardarArchivo = async (tipo, path) => {
      const existe = await client.query(
        "SELECT id FROM expediente_digital WHERE comerciante_id = $1 AND tipo_documento = $2",
        [comercianteId, tipo],
      );
      if (existe.rows.length > 0) {
        await client.query(
          "UPDATE expediente_digital SET enlace_archivo_nube = $1 WHERE id = $2",
          [path, existe.rows[0].id],
        );
      } else {
        await client.query(
          "INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube) VALUES ($1, $2, $3)",
          [comercianteId, tipo, path],
        );
      }
    };

    if (data.archivos?.archivo_carnet)
      await guardarArchivo(
        "CARNET_SANIDAD",
        data.archivos.archivo_carnet[0].path,
      );
    if (data.archivos?.archivo_puesto)
      await guardarArchivo("FOTO_PUESTO", data.archivos.archivo_puesto[0].path);

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
