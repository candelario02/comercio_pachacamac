const { Pool } = require('pg');
require('dotenv').config(); 

// Usamos DATABASE_URL que configuramos en Render/Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Monitoreo de errores
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error crítico: No se pudo conectar a la base de datos de Pachacámac:', err);
  } else {
    console.log('✅ Conexión exitosa a Neon: La base de datos está lista.');
  }
});

module.exports = pool;