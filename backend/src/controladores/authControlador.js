const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../configuracion/db');
const responder = require('../utilidades/respuesta');

const login = async (req, res) => {
    const correo = req.body.correo ? req.body.correo.trim().toLowerCase() : '';
    const contrasena = req.body.contrasena ? req.body.contrasena.trim() : '';

    try {
        const usuarioRes = await pool.query('SELECT * FROM obtener_usuario_login($1)', [correo]);

        if (usuarioRes.rows.length === 0) {
            return responder.error(res, "El correo electrónico no se encuentra registrado o la cuenta no existe.", 401);
        }

        const usuario = usuarioRes.rows[0];

        if (!usuario.cuenta_activa) {
            return responder.error(res, "Esta cuenta se encuentra desactivada temporalmente.", 403);
        }

        const hashDB = usuario.contrasena ? usuario.contrasena.trim() : '';
        const esValida = await bcrypt.compare(contrasena, hashDB);

        if (!esValida) {
            return responder.error(res, "La contraseña ingresada es incorrecta.", 401);
        }

        if (!process.env.JWT_SECRET) {
            console.error('❌ ERROR: JWT_SECRET no está definida en las variables de entorno.');
            return responder.error(res, "Error de configuración interna en el servidor de seguridad.", 500);
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol_nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        responder.exito(res, {
            token,
            usuario: {
                id: usuario.id,
                correo: usuario.correo_electronico,
                rol: usuario.rol_nombre 
            }
        }, "Bienvenido al sistema, acceso concedido.");

    } catch (error) {
        console.error('❌ Error Crítico en AuthControlador:', {
            mensaje: error.message,
            stack: error.stack,
            fecha: new Date().toISOString()
        });
        
        responder.error(res, "Error interno en el servidor de autenticación. Por favor, intente más tarde.");
    }
};

module.exports = { login };