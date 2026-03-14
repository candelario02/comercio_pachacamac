const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('./src/configuracion/db');

const crearUsuario = async () => {
    const correo = process.argv[2];
    const clavePlana = process.argv[3];
    const saltRounds = 10;

    if (!correo || !clavePlana) {
        console.log('❌ ERROR: Faltan datos (correo contraseña)');
        process.exit(1);
    }

    try {
        console.log(`⏳ Llamando al procedimiento almacenado para: ${correo}...`);

        // encriptamos la clave (esto siempre se hace en el Backend)
        const hashedClave = await bcrypt.hash(clavePlana, saltRounds);

      
        const query = `SELECT registrar_usuario_admin($1, $2)`;
        
        await pool.query(query, [correo, hashedClave]);

        console.log('-------------------------------------------');
        console.log('✅ PROCEDIMIENTO EJECUTADO: ADMIN CREADO');
        console.log(`📧 Correo: ${correo}`);
        console.log('-------------------------------------------');
        process.exit();

    } catch (error) {
        if (error.code === '23505') {
            console.error('❌ Error: El correo ya existe en la base de datos.');
        } else {
            console.error('❌ Error en el Procedimiento:', error.message);
        }
        process.exit(1);
    }
};

crearUsuario();