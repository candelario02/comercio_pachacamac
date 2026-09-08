const responder = {
  exito: (res, datos = null, mensaje = "Operación exitosa", codigo = 200) => {
    return res.status(codigo).json({ success: true, data: datos, mensaje });
  },

  error: (res, mensaje = "Error interno", codigo = 500, detalles = null) => {
    const cuerpo = { success: false, mensaje };
    if (detalles && process.env.NODE_ENV !== "production") {
      cuerpo.detalles = detalles;
    }
    return res.status(codigo).json(cuerpo);
  },

  lista: (res, datos = [], mensaje = "Listado obtenido") => {
    return res.status(200).json({ success: true, data: datos, mensaje });
  },

  creado: (res, datos = null, mensaje = "Recurso creado") => {
    return res.status(201).json({ success: true, data: datos, mensaje });
  },

  noEncontrado: (res, mensaje = "Recurso no encontrado") => {
    return res.status(404).json({ success: false, mensaje });
  },
};

module.exports = responder;
