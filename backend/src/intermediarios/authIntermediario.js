const jwt = require('jsonwebtoken');


const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: "Token no proporcionado" });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Sesión expirada" });
    }
};


const verificarAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: "No autorizado" });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        // Permitimos que entren administradores, tesoreros o fiscalizadores
        const rolesAutorizados = ['administrador', 'tesoreria', 'fiscalizacion'];
        
        if (!rolesAutorizados.includes(decodificado.rol)) {
            return res.status(403).json({ mensaje: "No tienes permisos para esta acción" });
        }
        
        req.usuario = decodificado; 
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido" });
    }
};



const verificarComerciante = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: "No autorizado" });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
       
        if (decodificado.rol !== 'comerciante') {
            return res.status(403).json({ mensaje: "Acceso exclusivo para Comerciante" });
        }
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido" });
    }
};

module.exports = { 
    verificarToken, 
    verificarAdmin, 
    verificarComerciante 
};