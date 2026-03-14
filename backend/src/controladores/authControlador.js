const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../configuracion/db');

const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
      
        const usuarioRes = await pool.query('SELECT * FROM obtener_usuario_login($1)', [correo]);

        if (usuarioRes.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "El correo electrónico no se encuentra registrado o la cuenta no existe." 
            });
        }

        const usuario = usuarioRes.rows[0];

        // verificación de estado de cuenta
        if (!usuario.cuenta_activa) {
            return res.status(403).json({ 
                success: false, 
                mensaje: "Esta cuenta se encuentra desactivada temporalmente." 
            });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        
        if (!esValida) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "La contraseña ingresada es incorrecta." 
            });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol_nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

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
        console.error('❌ Error Crítico en AuthControlador (Stored Procedure):', error.message);
        
        res.status(500).json({ 
            success: false, 
            mensaje: "Error interno en el servidor de autenticación." 
        });
    }
};

module.exports = { login };