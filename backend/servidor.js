const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRutas = require('./src/rutas/authRutas');
const adminRutas = require('./src/rutas/adminRutas');
const publicoRutas = require('./src/rutas/publicoRutas');
const comercianteRutas = require('./src/rutas/comercianteRutas');

const app = express();
const path = require('path');

// Esto hace que las carpetas de subida sean accesibles desde el navegador
app.use('/uploads/carnets', express.static(path.join(__dirname, 'uploads/carnets')));
app.use('/uploads/vouchers', express.static(path.join(__dirname, 'uploads/vouchers')));

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

app.use(express.json());


app.use('/api/auth', authRutas);
app.use('/api/admin', adminRutas);
app.use('/api/publico', publicoRutas);
app.use('/api/comerciante', comercianteRutas);

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        mensaje: "Ruta no encontrada en el servidor de Pachacámac" 
    });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 SERVIDOR MUNICIPAL DE PACHACÁMAC (NUBE)`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`--------------------------------------------------`);
});