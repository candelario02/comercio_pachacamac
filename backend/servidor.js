const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRutas = require('./src/rutas/authRutas');
const adminRutas = require('./src/rutas/adminRutas');
const publicoRutas = require('./src/rutas/publicoRutas');
const comercioRutas = require('./src/rutas/comercioRutas');

const app = express();

app.use(cors({
    // agregamos la url de la web
    origin: ['http://localhost:5173', 'https://tu-frontend.vercel.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


app.use(express.json());

// registro rutas
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


// puerto dinamico
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 SERVIDOR MUNICIPAL DE PACHACÁMAC`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌍 Host: 0.0.0.0 (Aceptando conexiones externas)`);
    console.log(`--------------------------------------------------`);
});
