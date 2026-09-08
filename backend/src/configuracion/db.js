const { Pool } = require('pg');


if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR CRÍTICO: La variable DATABASE_URL no está definida en el panel de Render.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
});

pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('❌ FALLO DE CONEXIÓN A NEON:', err.message);
    } else {
        console.log('✅ CONEXIÓN EXITOSA con Neon nube');
    }
});

module.exports = pool;