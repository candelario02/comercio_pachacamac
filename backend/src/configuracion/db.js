const { Pool } = require('pg');

// 1. Ya no cargamos archivos .env manuales. 
// Render inyecta DATABASE_URL automáticamente desde su panel de control.
if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR CRÍTICO: La variable DATABASE_URL no está definida en el panel de Render.");
    process.exit(1);
}

// 2. Configuración simplificada para la Nube
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon requiere SSL obligatorio para funcionar de forma segura
    ssl: {
        rejectUnauthorized: false
    }
});

// 3. Monitoreo de errores
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
});

// 4. Prueba de conexión silenciosa (solo avisa si falla o conecta al inicio)
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('❌ FALLO DE CONEXIÓN A NEON:', err.message);
    } else {
        console.log('✅ CONEXIÓN EXITOSA: El Backend está hablando con Neon (Nube).');
    }
});

module.exports = pool;