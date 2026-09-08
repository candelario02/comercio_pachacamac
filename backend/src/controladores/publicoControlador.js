const pool = require("../configuracion/db");
const responder = require("../utilidades/respuesta");

// 1. Listar Rubros para el select
const listarRubros = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre FROM rubros ORDER BY nombre ASC",
    );
    responder.lista(res, result.rows);
  } catch (error) {
    console.error("Error al listar rubros:", error);
    responder.error(res, "Error al obtener rubros");
  }
};

// 2. Listar todas las Actividades
const listarActividades = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, rubro_id, descripcion, requiere_carnet_sanidad FROM actividades ORDER BY descripcion ASC",
    );
    responder.lista(res, result.rows);
  } catch (error) {
    console.error("Error al listar actividades:", error);
    responder.error(res, "Error al obtener actividades");
  }
};

// 3. Info combinada
const listarInfoPublicaRubrosActividad = async (req, res) => {
  try {
    const query = `
            SELECT 
                r.id AS rubro_id, 
                r.nombre AS rubro_nombre, 
                a.id AS actividad_id,
                a.descripcion AS actividad_desc, 
                a.requiere_carnet_sanidad
            FROM rubros r
            LEFT JOIN actividades a ON r.id = a.rubro_id
            ORDER BY r.id ASC;
        `;
    const result = await pool.query(query);
    responder.lista(res, result.rows);
  } catch (error) {
    console.error("❌ ERROR EN BACKEND:", error.message);
    responder.error(res, "Error en base de datos");
  }
};

// 4. Listar Sectores para el select
const listarSectores = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre FROM sectores_distrito ORDER BY nombre ASC",
    );
    responder.lista(res, result.rows);
  } catch (error) {
    console.error("Error al listar sectores:", error);
    responder.error(res, "Error en base de datos");
  }
};
// Consultar DNI en API externa de Reniec
const consultarDniReniec = async (req, res) => {
  const { dni } = req.params;
  if (!/^\d{8}$/.test(dni)) {
    return responder.error(res, "DNI debe tener 8 dígitos", 400);
  }

  const apiToken = process.env.RENIEC_API_TOKEN;
  if (!apiToken) {
    return responder.error(res, "Error de configuración del servicio de validación de DNI", 500);
  }
  const url = `https://dniruc.apisperu.com/api/v1/dni/${dni}?token=${apiToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error || !data.dni) {
      return responder.noEncontrado(res, "DNI no encontrado en Reniec");
    }

    responder.exito(res, {
      dni: data.dni,
      nombres: data.nombres || "",
      apellidoPaterno: data.apellidoPaterno || "", 
      apellidoMaterno: data.apellidoMaterno || "", 
    });
  } catch (error) {
    console.error("Error al consultar Reniec:", error);
    responder.error(res, "Error al consultar Reniec");
  }
};


module.exports = {
  listarRubros,
  listarActividades,
  listarInfoPublicaRubrosActividad,
  listarSectores,
  consultarDniReniec,
};
