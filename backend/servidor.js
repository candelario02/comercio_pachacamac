const express = require('express');
const cors = require('cors');

// No es necesario cargar dotenv si ya borraste el archivo .env, 
// pero no estorba dejarlo.
require('dotenv').config();

// --- CORRECCIÓN DE RUTAS (Entrando a /src/) ---
const authRutas = require('./src/rutas/authRutas');
const adminRutas = require('./src/rutas/adminRutas');
const publicoRutas = require('./src/rutas/publicoRutas');
const comercioRutas = require('./src/rutas/comercioRutas');

const app = express();

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
app.use('/api/comercio', comercioRutas);


app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        mensaje: "Ruta no encontrada en el servidor de Pachacámac" 
    });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 SERVIDOR MUNICIPAL DE PACHACÁMAC (NUBE)`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`--------------------------------------------------`);
});