const express = require('express');
const cors = require('cors');
// Nota: Dejamos el require('dotenv').config() por si Render necesita 
// leer variables internas, pero ya no dependerá de archivos físicos locales.
require('dotenv').config();

const authRutas = require('./rutas/authRutas');
const adminRutas = require('./rutas/adminRutas');
const publicoRutas = require('./rutas/publicoRutas');
const comercioRutas = require('./rutas/comercioRutas');

const app = express();

// CONFIGURACIÓN DE CORS PARA LA NUBE
app.use(cors({
    origin: function (origin, callback) {
        // Permitimos: 
        // 1. Peticiones sin origen (como Postman o el propio servidor)
        // 2. Cualquier subdominio de Vercel (muy importante porque Vercel cambia los IDs)
        // 3. Tu dominio local por si alguna vez vuelves a abrir el VS Code
        if (!origin || 
            origin.includes('vercel.app') || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Registro de rutas
app.use('/api/auth', authRutas);
app.use('/api/admin', adminRutas);
app.use('/api/publico', publicoRutas);
app.use('/api/comercio', comercioRutas);

// Manejador de rutas no encontradas
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