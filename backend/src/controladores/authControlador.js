const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../configuracion/db');

const login = async (req, res) => {
    // 1. Limpieza de datos (Trimming) para evitar errores por espacios invisibles
    const correo = req.body.correo ? req.body.correo.trim().toLowerCase() : '';
    const { contrasena } = req.body;

    try {
        // 2. Consulta a la base de datos mediante el Stored Procedure
        const usuarioRes = await pool.query('SELECT * FROM obtener_usuario_login($1)', [correo]);

        // 3. Verificación de existencia del usuario
        if (usuarioRes.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "El correo electrónico no se encuentra registrado o la cuenta no existe." 
            });
        }

        const usuario = usuarioRes.rows[0];

        // 4. Verificación de estado de cuenta (Seguridad administrativa)
        if (!usuario.cuenta_activa) {
            return res.status(403).json({ 
                success: false, 
                mensaje: "Esta cuenta se encuentra desactivada temporalmente." 
            });
        }

        // 5. Validación Profesional de Contraseña (Bcrypt)
        // Usamos .trim() en el hash de la DB por si el tipo de dato en Postgres es CHAR
        const hashDB = usuario.contrasena ? usuario.contrasena.trim() : '';
        const esValida = await bcrypt.compare(contrasena, hashDB);
        
        if (!esValida) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "La contraseña ingresada es incorrecta." 
            });
        }

        // 6. Validación de Clave Secreta para JWT (Seguridad de Servidor)
        if (!process.env.JWT_SECRET) {
            console.error('❌ ERROR: JWT_SECRET no está definida en las variables de entorno de Render.');
            return res.status(500).json({
                success: false,
                mensaje: "Error de configuración interna en el servidor de seguridad."
            });
        }

        // 7. Generación del Token de Acceso
        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol_nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 8. Respuesta Exitosa
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
        // Log detallado para depuración en Render
        console.error('❌ Error Crítico en AuthControlador:', {
            mensaje: error.message,
            stack: error.stack,
            fecha: new Date().toISOString()
        });
        
        res.status(500).json({ 
            success: false, 
            mensaje: "Error interno en el servidor de autenticación. Por favor, intente más tarde." 
        });
    }
};

module.exports = { login };