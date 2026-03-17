const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../configuracion/db');

const login = async (req, res) => {
    // 1. Mantenemos la limpieza de datos para evitar errores invisibles
    const correo = req.body.correo ? req.body.correo.trim().toLowerCase() : '';
    const contrasena = req.body.contrasena ? req.body.contrasena.trim() : '';

    try {
        // 2. Consulta original mediante el Stored Procedure
        const usuarioRes = await pool.query('SELECT * FROM obtener_usuario_login($1)', [correo]);

        // 3. Verificación de existencia (Funcionalidad original)
        if (usuarioRes.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "El correo electrónico no se encuentra registrado o la cuenta no existe." 
            });
        }

        const usuario = usuarioRes.rows[0];

        // 🟢 LOG DE DEPURACIÓN (Mantenlo para ver qué llega de la DB)
        console.log("--- DEBUG DATA BASE ---");
        console.log("Columnas recibidas:", Object.keys(usuario));
        console.log("Hash en DB:", usuario.contrasena);

        // 4. Verificación de estado de cuenta (Funcionalidad original - NO SE QUITA)
        if (!usuario.cuenta_activa) {
            return res.status(403).json({ 
                success: false, 
                mensaje: "Esta cuenta se encuentra desactivada temporalmente." 
            });
        }

        // 5. Validación de Contraseña con Bcrypt
        const hashDB = usuario.contrasena ? usuario.contrasena.trim() : '';
        const esValida = await bcrypt.compare(contrasena, hashDB);
        
        console.log("¿Bcrypt validó la clave?:", esValida);
        
        if (!esValida) {
            return res.status(401).json({ 
                success: false, 
                mensaje: "La contraseña ingresada es incorrecta." 
            });
        }

        // 6. Validación de Clave Secreta para JWT (Seguridad de Render)
        if (!process.env.JWT_SECRET) {
            console.error('❌ ERROR: JWT_SECRET no definida en Render.');
            return res.status(500).json({
                success: false,
                mensaje: "Error de configuración interna en el servidor."
            });
        }

        // 7. Generación del Token (Mantenemos la carga de ID y ROL original)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol_nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 8. Respuesta Exitosa Completa
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
        // Log detallado para auditoría en Render
        console.error('❌ Error Crítico en AuthControlador:', {
            mensaje: error.message,
            stack: error.stack,
            fecha: new Date().toISOString()
        });
        
        res.status(500).json({ 
            success: false, 
            mensaje: "Error interno en el servidor de autenticación." 
        });
    }
};

module.exports = { login };