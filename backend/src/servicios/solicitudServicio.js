const db = require("../configuracion/db");
const { cloudinary } = require("../configuracion/cloudinary");
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
      if (!data.contrasena) throw new Error("Contraseña requerida.");

      const userRes = await client.query(
        `INSERT INTO usuarios (correo_electronico, contrasena, rol_id) VALUES ($1, $2, $3) RETURNING id`,
        [correoLimpio, data.contrasena, 2],
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
          data.numero_celular,
          data.actividad_id,
          data.sector_id,
          data.latitud_puesto,
          data.longitud_puesto,
          data.desea_tramitar_carnet || false,
          "pendiente",
        ],
      );
      comercianteId = comercianteRes.rows[0].id;
    } else {
      comercianteId = comercianteExistente.id;
      await client.query(
        `UPDATE public.comerciantes SET 
       numero_celular = COALESCE($1, numero_celular), 
       actividad_id = COALESCE($2, actividad_id), 
       sector_id = COALESCE($3, sector_id), 
       latitud_puesto = COALESCE($4, latitud_puesto), 
       longitud_puesto = COALESCE($5, longitud_puesto), 
       desea_tramitar_carnet = COALESCE($6, desea_tramitar_carnet),
        estado_tramite = 'pendiente'
        WHERE id = $7`,
        [
          data.numero_celular || null,
          data.actividad_id || null,
          data.sector_id || null,
          data.latitud_puesto || null,
          data.longitud_puesto || null,
          data.desea_tramitar_carnet,
          comercianteId,
        ],
      );
      await client.query(
        `UPDATE public.comerciantes 
         SET estado_tramite = 'pendiente' 
         WHERE id = $1`,
        [comercianteId],
      );
    }
    const guardarArchivo = async (tipo, archivo) => {
      const nuevoEnlace = archivo.path;
      const nuevoPublicId = archivo.filename;

      const existe = await client.query(
        "SELECT id, public_id FROM expediente_digital WHERE comerciante_id = $1 AND tipo_documento = $2",
        [comercianteId, tipo],
      );

      if (existe.rows.length > 0) {
        const { id, public_id: oldPublicId } = existe.rows[0];

        if (oldPublicId && oldPublicId !== nuevoPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
            console.log(
              `Limpio: Foto vieja ${oldPublicId} borrada de la nube.`,
            );
          } catch (err) {
            console.error(
              "Error al borrar en Cloudinary (no detiene el proceso):",
              err.message,
            );
          }
        }

        await client.query(
          "UPDATE expediente_digital SET enlace_archivo_nube = $1, public_id = $2 WHERE id = $3",
          [nuevoEnlace, nuevoPublicId, id],
        );
      } else {
        await client.query(
          "INSERT INTO expediente_digital (comerciante_id, tipo_documento, enlace_archivo_nube, public_id) VALUES ($1, $2, $3, $4)",
          [comercianteId, tipo, nuevoEnlace, nuevoPublicId],
        );
      }
    };

    if (data.archivos?.archivo_carnet) {
      await guardarArchivo("CARNET_SANIDAD", data.archivos.archivo_carnet[0]);
    }

    if (data.archivos?.archivo_puesto) {
      await guardarArchivo("FOTO_PUESTO", data.archivos.archivo_puesto[0]);
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
