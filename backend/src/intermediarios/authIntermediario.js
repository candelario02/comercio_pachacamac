const jwt = require('jsonwebtoken');

// solo verifica si el token es válido
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

//  verifica si es administrador
const verificarAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: "No autorizado" });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        if (decodificado.rol !== 'administrador') {
            return res.status(403).json({ mensaje: "Acceso exclusivo para Administrador" });
        }
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido" });
    }
};

// ... al final de tu archivo authIntermediario.js

const verificarComerciante = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: "No autorizado" });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        // Aquí verificamos que el rol sea 'comerciante'
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