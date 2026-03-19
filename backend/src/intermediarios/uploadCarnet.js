const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 1. Determinamos la subcarpeta según el campo
        const subCarpeta = file.fieldname === 'voucher' ? 'vouchers' : 'carnets';

        // 2. process.cwd() nos lleva a la RAÍZ (donde está servidor.js y la carpeta uploads)
        // Ya no necesitas adivinar con "../../"
        const dir = path.join(process.cwd(), 'uploads', subCarpeta);
        
        // 3. Crear la carpeta físicamente si no existe
        if (!fs.existsSync(dir)) {
            console.log(`Creando directorio: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // 4. Nombre único para evitar sobrescribir fotos
        const prefijo = file.fieldname === 'voucher' ? 'PAGO-' : 'CARNET-';
        const uniqueName = `${prefijo}${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;