const pool = require('../configuracion/db');

// 1. Listar Rubros para el select
const listarRubros = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM rubros ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al listar rubros:", error);
        res.status(500).json({ error: "Error al obtener rubros" });
    }
};

// 2. Listar todas las Actividades 
const listarActividades = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, rubro_id, descripcion, requiere_carnet_sanidad FROM actividades ORDER BY descripcion ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al listar actividades:", error);
        res.status(500).json({ error: "Error al obtener actividades" });
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
        res.json(result.rows); 
    } catch (error) {
        console.error("❌ ERROR EN BACKEND:", error.message);
        res.status(500).json({ error: "Error en base de datos" });
    }
};

// 4. Listar Sectores para el select
const listarSectores = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM sectores_distrito ORDER BY nombre ASC');
        res.json(result.rows); 
    } catch (error) {
        console.error("Error al listar sectores:", error);
        res.status(500).json({ error: "Error en base de datos" });
    }
};

module.exports = { 
    listarRubros, 
    listarActividades,
    listarInfoPublicaRubrosActividad, 
    listarSectores
};