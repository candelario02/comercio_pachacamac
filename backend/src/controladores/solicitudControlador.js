const solicitudServicio = require('../servicios/solicitudServicio');
const bcrypt = require('bcryptjs');

const registrarSolicitud = async (req, res) => {
    try {
        
        const { contrasena, ...datosRestantes } = req.body;
        
      
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        
        const dataParaServicio = {
            ...datosRestantes,
            correo_electronico: req.body.correo, 
            hashedPassword,
            archivos: req.files
        };

       
        await solicitudServicio.crearSolicitudComerciante(dataParaServicio);
        
        res.status(201).json({ success: true, mensaje: "Solicitud registrada con éxito." });
    } catch (error) {
        console.error("Error en controlador:", error);
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

module.exports = { registrarSolicitud };