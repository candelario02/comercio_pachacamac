const pool = require("../configuracion/db");
const responder = require("../utilidades/respuesta");

// --- Obtener datos para el dashboard ---
const obtenerEstadisticas = async (req, res) => {
  try {
    const query = `
            SELECT 
                COUNT(*)::INT AS total,
                COUNT(*) FILTER (WHERE estado_tramite = 'pendiente')::INT AS pendientes,
                COUNT(*) FILTER (WHERE estado_tramite = 'formalizado')::INT AS formalizados
            FROM comerciantes WHERE eliminado = false;
        `;
    const result = await pool.query(query);
    responder.exito(res, result.rows[0], "Estadísticas obtenidas");
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    responder.error(res, "Error al cargar indicadores");
  }
};

const obtenerEstadisticasGraficos = async (req, res) => {
  try {
    const [resRubros, resSanidad] = await Promise.all([
      pool.query("SELECT * FROM vista_conteo_rubros"),
      pool.query("SELECT * FROM vista_conteo_sanidad"),
    ]);

    responder.exito(res, { datosRubros: resRubros.rows, datosSanidad: resSanidad.rows });
  } catch (error) {
    console.error("Error al obtener datos para gráficos:", error);
    responder.error(res, "Error al cargar los datos de los gráficos");
  }
};

// --- Solicitudes Pendientes ---
const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const query =
      "SELECT * FROM vista_solicitudes_pendientes WHERE estado_tramite = 'pendiente'";
    const result = await pool.query(query);
    responder.lista(res, result.rows);
  } catch (error) {
    responder.error(res, "Error al obtener solicitudes pendientes");
  }
};

// --- actualizacion de  estados desde el frotend admin
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_tramite, observaciones_admin } = req.body;
    const estadoNormalizado = estado_tramite
      ? estado_tramite.toLowerCase()
      : "pendiente";
    const estadosPermitidos = [
      "pendiente",
      "aprobado",
      "rechazado",
      "observado",
    ];

    if (!estadosPermitidos.includes(estadoNormalizado)) {
      return responder.error(res, "Estado no válido", 400);
    }

    await pool.query("BEGIN");

    const query = `UPDATE comerciantes SET estado_tramite = $1, observaciones_admin = $2 WHERE id = $3 RETURNING usuario_id`;
    const resUpdate = await pool.query(query, [
      estadoNormalizado,
      observaciones_admin,
      id,
    ]);

    if (estadoNormalizado === "observado" && resUpdate.rows.length > 0) {
      const usuario_id = resUpdate.rows[0].usuario_id;
      await pool.query(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) 
                 VALUES ($1, $2, $3, $4)`,
        [
          usuario_id,
          "Solicitud Observada",
          `Tu trámite tiene observaciones: ${observaciones_admin}. Por favor revisa y corrige.`,
          "alerta",
        ],
      );
    }

    await pool.query("COMMIT");
    responder.exito(res, null, "Actualizado y notificado con éxito");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al observar:", error);
    responder.error(res, "Error interno al actualizar estado");
  }
};

// --- listar pagos pendientes ---
const listarPagosPendientes = async (req, res) => {
  try {
    const query =
      "SELECT * FROM vista_pagos_pendientes ORDER BY fecha_pago DESC";
    const result = await pool.query(query);
    responder.lista(res, result.rows);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    responder.error(res, "Error al consultar pagos");
  }
};
/// --- aprobar y generar orden deuda ---
const aprobarTramiteYGenerarDeuda = async (req, res) => {
  const { id } = req.params;
  const { monto_confirmado, incluye_sanidad } = req.body;
  const adminId = req.usuario.id;

  try {
    await pool.query("BEGIN");
      const ipReal = (
      req.headers["x-forwarded-for"] ||
      req.ip ||
      req.socket.remoteAddress
    )
      .split(",")[0]
      .trim();
    await pool.query("SELECT set_config('app.current_admin_id', $1, true)", [String(adminId)]);
    await pool.query("SELECT set_config('app.current_ip', $1, true)", [ipReal]);
    const resInfo = await pool.query(
      `SELECT c.id, c.usuario_id, c.exento_pago, a.costo, a.descripcion as actividad_nombre
             FROM comerciantes c 
             JOIN actividades a ON c.actividad_id = a.id 
             WHERE c.id = $1`,
      [id],
    );

    if (resInfo.rows.length === 0) throw new Error("Comerciante no encontrado");
    const comerciante = resInfo.rows[0];

    const montoFinal =
      parseFloat(monto_confirmado) || parseFloat(comerciante.costo) || 0;

    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const mesActual = meses[new Date().getMonth()];
    const numeroOP = `OP-${Date.now().toString().slice(-8)}`;

    const detalleOrden = {
      actividad: comerciante.actividad_nombre,
      mes: mesActual,
      genera_sanidad: incluye_sanidad === true,
    };

    const resOrden = await pool.query(
      `INSERT INTO ordenes_pago (comerciante_id, monto_total, detalle, estado, creado_por) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, montoFinal, JSON.stringify(detalleOrden), "pendiente", adminId],
    );
    const ordenId = resOrden.rows[0].id;

    if (comerciante.exento_pago) {
      await pool.query(
        "UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1",
        [id],
      );

      await pool.query(
        `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, estado, orden_pago_id) 
                 VALUES ($1, 0, $2, $3, 'pagado', $4)`,
        [id, `EXO-${ordenId}`, mesActual, ordenId],
      );
    } else {
      await pool.query(
        "UPDATE comerciantes SET estado_tramite = 'aprobado' WHERE id = $1",
        [id],
      );

      await pool.query(
        `INSERT INTO pagos_municipales (comerciante_id, monto_pagado, numero_operacion, mes_correspondiente, estado, orden_pago_id) 
                 VALUES ($1, $2, $3, $4, 'pendiente', $5)`,
        [id, montoFinal, numeroOP, mesActual, ordenId],
      );
    }

    // 3. Notificación al usuario
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) 
             VALUES ($1, $2, $3, $4)`,
      [
        comerciante.usuario_id,
        comerciante.exento_pago ? "Trámite Formalizado" : "Orden de Pago Lista",
        comerciante.exento_pago
          ? "Tu trámite ha sido formalizado con éxito."
          : `Se ha generado tu orden por S/ ${montoFinal.toFixed(2)}.`,
        comerciante.exento_pago ? "exito" : "pago",
      ],
    );

    await pool.query("COMMIT");
    responder.exito(res, { ordenId }, "Circuito de orden y pago completado");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error profesional en BD:", error);
    responder.error(res, error.message);
  }
};

/// --- confirmar pago final y Formalizar ---
const confirmarPagoYFinalizar = async (req, res) => {
  const { id } = req.params;
  const { vigencia_comercio, vigencia_sanidad } = req.body;
  const adminId = req.usuario.id;

  try {
    await pool.query("BEGIN");

    const resPago = await pool.query(
      `UPDATE pagos_municipales SET estado = 'pagado' WHERE id = $1 
       RETURNING comerciante_id, orden_pago_id, detalle_carnet`,
      [id],
    );
    if (resPago.rows.length === 0) throw new Error("Pago no encontrado");
    const { comerciante_id, orden_pago_id, detalle_carnet } = resPago.rows[0];

    let detalleJSON = {};
    if (orden_pago_id) {
      const resOrden = await pool.query(
        `SELECT detalle FROM ordenes_pago WHERE id = $1`,
        [orden_pago_id],
      );
      detalleJSON = resOrden.rows[0]?.detalle || {};
      await pool.query(
        `UPDATE ordenes_pago SET estado = 'pagado' WHERE id = $1`,
        [orden_pago_id],
      );
    }

    const resCom = await pool.query(
      `UPDATE comerciantes SET estado_tramite = 'formalizado' WHERE id = $1 RETURNING usuario_id, desea_tramitar_carnet`,
      [comerciante_id],
    );
    const { usuario_id, desea_tramitar_carnet } = resCom.rows[0];
    const debeGenerarSanidad =
      (detalleJSON.hasOwnProperty("genera_sanidad")
        ? detalleJSON.genera_sanidad
        : false) ||
      parseFloat(detalle_carnet) > 0 ||
      desea_tramitar_carnet === true;

    const mesesCom = parseInt(vigencia_comercio) || 12;
    const mesesSan = debeGenerarSanidad ? parseInt(vigencia_sanidad) || 6 : 0;

    await pool.query(
      `INSERT INTO autorizaciones (comerciante_id, tipo_autorizacion, fecha_emision, fecha_vencimiento, codigo_qr_unico)
       VALUES ($1, 'COMERCIO', CURRENT_DATE, CURRENT_DATE + ($2 || ' months')::interval, $3)`,
      [
        comerciante_id,
        mesesCom,
        `QR-COM-${comerciante_id.toString().slice(-5)}-${Date.now()}`,
      ],
    );

    if (debeGenerarSanidad) {
      await pool.query(
        `INSERT INTO autorizaciones (comerciante_id, tipo_autorizacion, fecha_emision, fecha_vencimiento, codigo_qr_unico)
         VALUES ($1, 'SANIDAD', CURRENT_DATE, CURRENT_DATE + ($2 || ' months')::interval, $3)`,
        [
          comerciante_id,
          mesesSan,
          `QR-SAN-${comerciante_id.toString().slice(-5)}-${Date.now()}`,
        ],
      );
    }

    // 7. Notificación
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, tipo) VALUES ($1, $2, $3)`,
      [
        usuario_id,
        `✅ Tu pago ha sido verificado. Ya puedes descargar tus carnets.`,
        "exito",
      ],
    );

    await pool.query("COMMIT");
    responder.exito(res, null, "Formalización exitosa");
  } catch (error) {
    await pool.query("ROLLBACK");
    responder.error(res, error.message);
  }
};

const obtenerFormalizados = async (req, res) => {
  try {
    const { buscar } = req.query;

    let consulta = "SELECT * FROM vista_formalizados";
    let parametros = [];

    if (buscar && buscar.trim() !== "") {
      consulta +=
        " WHERE dni LIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1";
      parametros.push(`%${buscar.trim()}%`);
    }
    consulta += " ORDER BY fecha_confirmacion DESC";

    const { rows } = await pool.query(consulta, parametros);
    responder.lista(res, rows);
  } catch (error) {
    console.error("Error en obtenerFormalizados:", error);
    responder.error(res, "Error al cargar formalizados");
  }
};

const gestionarActividad = async (req, res) => {
  const { accion, id, rubro_id, codigo, descripcion, requiere_sanidad } =
    req.body;

  try {
    await pool.query("BEGIN");

    const ipReal = (
      req.headers["x-forwarded-for"] ||
      req.ip ||
      req.socket.remoteAddress
    )
      .split(",")[0]
      .trim();

    await pool.query("SELECT set_config('app.current_admin_id', $1, true)", [String(req.usuario.id)]);
    await pool.query("SELECT set_config('app.current_ip', $1, true)", [ipReal]);

    await pool.query(
      `CALL sp_gestionar_actividad($1, $2, $3, $4, $5, $6, NULL)`,
      [
        accion,
        id || null,
        rubro_id || null,
        codigo || null,
        descripcion || null,
        requiere_sanidad || false,
      ],
    );

    await pool.query("COMMIT");

    responder.exito(res, null, `Operación ${accion} realizada.`);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en gestionarActividad:", error);
    responder.error(res, "Error al gestionar actividad");
  }
};

const listarActividades = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, r.nombre as nombre_rubro FROM actividades a JOIN rubros r ON a.rubro_id = r.id ORDER BY a.id DESC;`,
    );
    responder.lista(res, result.rows);
  } catch (error) {
    responder.error(res, "Error al obtener la lista de actividades");
  }
};

const gestionarRubro = async (req, res) => {
  const { accion, id, nombre, descripcion } = req.body;

  try {
    await pool.query("BEGIN");

    const ipReal = (
      req.headers["x-forwarded-for"] ||
      req.ip ||
      req.socket.remoteAddress
    )
      .split(",")[0]
      .trim();

    await pool.query("SELECT set_config('app.current_admin_id', $1, true)", [String(req.usuario.id)]);
    await pool.query("SELECT set_config('app.current_ip', $1, true)", [ipReal]);

    await pool.query(`CALL sp_gestionar_rubro($1, $2, $3, $4, $5)`, [
      accion,
      id || null,
      nombre || null,
      descripcion || null,
      false,
    ]);

    await pool.query("COMMIT");

    responder.exito(res, null, "Operación realizada con éxito.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en gestionarRubro:", error);
    responder.error(res, "Error al procesar la solicitud.");
  }
};

const obtenerRubros = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, descripcion FROM rubros ORDER BY id ASC",
    );
    responder.lista(res, resultado.rows);
  } catch (error) {
    responder.error(res, "Error al obtener la lista de rubros");
  }
};
const ExcelJS = require("exceljs");

const exportarExcelFormalizados = async (req, res) => {
  try {
    const { buscar, mes, anio } = req.query;
    let consulta = "SELECT * FROM vista_formalizados WHERE 1=1";
    let parametros = [];
    let pIndex = 1;

    if (buscar) {
      consulta += ` AND dni LIKE $${pIndex++}`;
      parametros.push(`%${buscar}%`);
    }

    if (mes) {
      consulta += ` AND EXTRACT(MONTH FROM fecha_confirmacion) = $${pIndex++}`;
      parametros.push(mes);
    }
    if (anio) {
      consulta += ` AND EXTRACT(YEAR FROM fecha_confirmacion) = $${pIndex++}`;
      parametros.push(anio);
    }

    consulta += " ORDER BY fecha_vencimiento ASC";

    const { rows } = await pool.query(consulta, parametros);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Padron_Formalizados");

    worksheet.columns = [
      { header: "DNI", key: "dni", width: 15 },
      { header: "NOMBRES", key: "nombres", width: 25 },
      { header: "APELLIDOS", key: "apellidos", width: 25 },
      { header: "ACTIVIDAD", key: "actividad_nombre", width: 30 },
      { header: "ESTADO", key: "estado_tramite", width: 15 },
      { header: "VENCIMIENTO", key: "fecha_vencimiento", width: 15 },
    ];

    worksheet.addRows(rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Reporte_Formalizados.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al exportar:", error);
    responder.error(res, "Error al generar el reporte");
  }
};
//para validra que el comerciante sea formalizado mendiande QR
const validarQRPublico = async (req, res) => {
  const { dni } = req.params;
  const { tipo } = req.query;

  try {
    let query;
    let params = [dni];
    let tipoValidado = tipo === "sanidad" ? "sanidad" : "comercio";

    if (tipo === "sanidad") {
      query = `
                SELECT 
                    c.nombres, 
                    c.apellidos, 
                    c.dni, 
                    a.fecha_vencimiento,
                    a.tipo_autorizacion
                FROM comerciantes c
                JOIN autorizaciones a ON c.id = a.comerciante_id
                WHERE c.dni = $1 
                  AND (a.tipo_autorizacion = 'SANIDAD' OR a.codigo_qr_unico LIKE '%SAN%')
                ORDER BY a.fecha_emision DESC
                LIMIT 1
            `;
    } else {
      query = `
                SELECT c.nombres, c.apellidos, c.dni, a.fecha_vencimiento, a.tipo_autorizacion
                FROM comerciantes c
                JOIN autorizaciones a ON c.id = a.comerciante_id
                WHERE c.dni = $1 
                  AND (a.tipo_autorizacion = 'COMERCIO' OR a.tipo_autorizacion IS NULL)
                ORDER BY a.fecha_emision DESC
                LIMIT 1
            `;
    }

    const resultado = await pool.query(query, params);

    if (resultado.rows.length > 0) {
      responder.exito(res, { ...resultado.rows[0], tipoValidado });
    } else {
      responder.noEncontrado(res, "Credencial no válida o no encontrada");
    }
  } catch (error) {
    console.error("Error en validación pública:", error);
    responder.error(res, "Error en el servidor");
  }
};

module.exports = {
  obtenerEstadisticas,
  obtenerEstadisticasGraficos,
  obtenerSolicitudesPendientes,
  listarPagosPendientes,
  aprobarTramiteYGenerarDeuda,
  confirmarPagoYFinalizar,
  obtenerFormalizados,
  validarQRPublico,
  exportarExcelFormalizados,
  actualizarEstado,
  gestionarActividad,
  listarActividades,
  gestionarRubro,
  obtenerRubros,
};
