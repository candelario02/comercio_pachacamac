const { Pool } = require('pg');
require('dotenv').config(); 

// Configuramos la conexión de forma inteligente
const pool = new Pool({
  // En tu PC buscará la DATABASE_URL del .env local
  // En Render buscará la DATABASE_URL que pegamos en el panel
  connectionString: process.env.DATABASE_URL,
  
  // CONDICIÓN SSL: Solo se activa en producción (Render)
  // En local (PC) se desactiva para evitar el error de conexión
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Monitoreo de errores
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error crítico: No se pudo conectar a la base de datos:', err.message);
  } else {
    // Un mensaje que te diga dónde estás conectado
    const ambiente = process.env.NODE_ENV === 'production' ? 'NUBE (Neon)' : 'LOCAL (PC)';
    console.log(`✅ Conexión exitosa a la base de datos en ambiente: ${ambiente}`);
  }
});

module.exports = pool;