const solicitudServicio = require('../servicios/solicitudServicio');
const bcrypt = require('bcrypt');

const registrarSolicitud = async (req, res) => {
    try {
        // 1. Extraemos datos del cuerpo
        const { contrasena, ...datosRestantes } = req.body;
        
        // 2. Hasheamos la contraseña antes de pasarla al servicio
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        // 3. Empaquetamos todo para el servicio
        const dataParaServicio = {
            ...datosRestantes,
            correo_electronico: req.body.correo, // Ajuste de nombre de campo
            hashedPassword,
            archivo: req.file // Multer pone el archivo aquí
        };

        // 4. Llamamos al servicio (aquí ocurre la magia de la transacción)
        await solicitudServicio.crearSolicitudComerciante(dataParaServicio);
        
        res.status(201).json({ success: true, mensaje: "Solicitud registrada con éxito." });
    } catch (error) {
        console.error("Error en controlador:", error);
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

module.exports = { registrarSolicitud };