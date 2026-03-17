const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../configuracion/db');

const login = async (req, res) => {
    // 1. Limpieza de datos de entrada
    const correo = req.body.correo ? req.body.correo.trim().toLowerCase() : '';
    const contrasena = req.body.contrasena ? req.body.contrasena.trim() : ''; // Agregamos trim aquí

    try {
        // 2. Consulta a la base de datos
        const usuarioRes = await pool.query('SELECT * FROM obtener_usuario_login($1)', [correo]);

        if (usuarioRes.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "El correo electrónico no se encuentra registrado o la cuenta no existe." 
            });
        }

        const usuario = usuarioRes.rows[0];

        // 3. Verificación de estado de cuenta
        if (!usuario.cuenta_activa) {
            return res.status(403).json({ 
                success: false, 
                mensaje: "Esta cuenta se encuentra desactivada temporalmente." 
            });
        }

        // 4. Validación Profesional de Contraseña (Bcrypt)
        // Limpiamos el hash de la DB por si es de tipo CHAR en Postgres
        const hashDB = usuario.contrasena ? usuario.contrasena.trim() : '';
        
        // Comparamos ambos valores ya saneados
        const esValida = await bcrypt.compare(contrasena, hashDB);
        
        // Mantenemos este log solo para tu tranquilidad inicial en Render
        console.log(`--- Intento de login para: ${correo} | ¿Válido?: ${esValida} ---`);
        
        if (!esValida) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "La contraseña ingresada es incorrecta." 
            });
        }

        // 5. Validación de JWT_SECRET en Render
        if (!process.env.JWT_SECRET) {
            console.error('❌ ERROR: JWT_SECRET no configurada en Render.');
            return res.status(500).json({
                success: false,
                mensaje: "Error de configuración interna en el servidor."
            });
        }

        // 6. Generación del Token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol_nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 7. Respuesta Final
        res.status(200).json({
            success: true,
            mensaje: `Bienvenido al sistema, acceso concedido.`,
            token,
            usuario: {
                id: usuario.id,
                correo: usuario.correo_electronico,
                rol: usuario.rol_nombre 
            }
        });

    } catch (error) {
        console.error('❌ Error Crítico en AuthControlador:', error.message);
        res.status(500).json({ 
            success: false, 
            mensaje: "Error interno en el servidor de autenticación." 
        });
    }
};

module.exports = { login };