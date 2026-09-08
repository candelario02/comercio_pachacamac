const solicitudServicio = require("../servicios/solicitudServicio");
const bcrypt = require("bcryptjs");
const responder = require("../utilidades/respuesta");

const registrarSolicitud = async (req, res) => {
  try {
    const { contrasena, ...datosRestantes } = req.body;

    let hashedPassword = null;
    if (contrasena) {
      hashedPassword = await bcrypt.hash(contrasena, 10);
    }

    const dataParaServicio = {
      ...datosRestantes,
      correo_electronico: req.body.correo_electronico,
      contrasena: hashedPassword, 
      archivos: req.files,
    };

    await solicitudServicio.crearSolicitudComerciante(dataParaServicio);
    responder.creado(res, null, "Solicitud registrada con éxito.");
  } catch (error) {
    console.error("Error en controlador:", error);
    responder.error(res, error.message);
  }
};

module.exports = { registrarSolicitud };
