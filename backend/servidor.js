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
    // Agregamos tu URL real de Vercel y mantenemos localhost para tus pruebas
    origin: [
        'http://localhost:5173', 
        'https://comercio-pachacamac-9hg6.vercel.app' // Tu URL real según la captura
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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