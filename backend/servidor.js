const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRutas = require('./src/rutas/authRutas');
const adminRutas = require('./src/rutas/adminRutas');
const publicoRutas = require('./src/rutas/publicoRutas');
const comercioRutas = require('./src/rutas/comercioRutas');

const app = express();

// CONFIGURACIÓN DE CORS PROFESIONAL
app.use(cors({
    origin: [
        'http://localhost:5173',                      // Vite (Puerto estándar)
        'http://localhost:10000',                     // Tu nuevo puerto de Backend/Proxy
        'http://127.0.0.1:5173',                      // IP local alternativa
        'https://comercio-pachacamac-9hg6.vercel.app' // Tu URL real de Vercel
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // Recomendado para que no fallen los tokens
}));

app.use(express.json());

// Registro de rutas (Se mantienen igual, están perfectas)
app.use('/api/auth', authRutas);
app.use('/api/admin', adminRutas);
app.use('/api/publico', publicoRutas);
app.use('/api/comercio', comercioRutas);

// Manejador de rutas no encontradas (El mensaje que vimos en Render)
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        mensaje: "Ruta no encontrada en el servidor de Pachacámac" 
    });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 SERVIDOR MUNICIPAL DE PACHACÁMAC`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌍 Host: 0.0.0.0`);
    console.log(`--------------------------------------------------`);
});