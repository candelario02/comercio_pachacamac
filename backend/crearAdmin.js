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

/*
ejecutar desde la consola dentro de backend
$env:DATABASE_URL="postgresql://neondb_owner:npg_bJfZ9xKztr5W@ep-plain-waterfall-anpu0clm-pooler.c-6.us-east-1.aws.neon.tech/gestion_comercio_ambulatorio?sslmode=require"; node crearAdmin.js jocks@gmail.com 0202*/