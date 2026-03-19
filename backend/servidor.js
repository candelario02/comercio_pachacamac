const express = require('express');
const cors = require('cors');
const path = require('path'); // Asegúrate de que esté aquí arriba
require('dotenv').config();

const app = express();

// 1. CONFIGURACIÓN DE SEGURIDAD (CORS) - DEBE IR PRIMERO
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || 
            origin.includes('vercel.app') || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. MIDDLEWARES DE PARSEO
app.use(express.json());

// 3. CARPETAS ESTÁTICAS (LAS IMÁGENES)
// Verifica que en tu VS Code la carpeta 'uploads' esté en la RAÍZ (junto a servidor.js)
app.use('/uploads/carnets', express.static(path.join(__dirname, 'uploads', 'carnets')));
app.use('/uploads/vouchers', express.static(path.join(__dirname, 'uploads', 'vouchers')));

// 4. RUTAS DE LA API
const authRutas = require('./src/rutas/authRutas');
const adminRutas = require('./src/rutas/adminRutas');
const publicoRutas = require('./src/rutas/publicoRutas');
const comercianteRutas = require('./src/rutas/comercianteRutas');

app.use('/api/auth', authRutas);
app.use('/api/admin', adminRutas);
app.use('/api/publico', publicoRutas);
app.use('/api/comerciante', comercianteRutas);

// 5. MANEJADOR DE RUTAS NO ENCONTRADAS (404)
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        mensaje: "Ruta no encontrada en el servidor de Pachacámac" 
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR LISTO EN PUERTO: ${PORT}`);
});