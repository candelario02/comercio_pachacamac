const { Pool } = require('pg');
const path = require('path');

// 1. Determinar el archivo según el ambiente
const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.produccion' 
    : '.env.desarrollo';

// 2. Cargar variables desde la raíz del proyecto (process.cwd())
const envPath = path.join(process.cwd(), envFile);
require('dotenv').config({ path: envPath });

console.log("---------------------------------------------------------");
console.log(`📂 Cargando configuración desde: ${envPath}`);

// 3. Validación de seguridad (Previene el error de "client password must be a string")
if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR CRÍTICO: La variable DATABASE_URL no está definida.");
    console.error("👉 Asegúrate de que el archivo .env.desarrollo exista en la raíz y tenga el formato correcto.");
    process.exit(1); 
}

// 4. Configuración del Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // SSL solo en producción (Neon/Render)
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
});

// 5. Monitoreo de errores globales del pool
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
    process.exit(-1);
});

// 6. Prueba de conexión inicial
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error de conexión a la base de datos:', err.message);
        console.error('Ambiente detectado:', process.env.NODE_ENV || 'development');
    } else {
        const ambiente = process.env.NODE_ENV === 'production' ? 'NUBE (Neon)' : 'LOCAL (PC)';
        try {
            const dbHost = new URL(process.env.DATABASE_URL).hostname;
            console.log(`✅ Conexión exitosa a la base de datos en ambiente: ${ambiente}`);
            console.log(`🚀 Servidor conectado a: ${dbHost}`);
        } catch (e) {
            console.log(`✅ Conexión exitosa (Ambiente: ${ambiente})`);
        }
        console.log('---------------------------------------------------------');
    }
});

module.exports = pool;