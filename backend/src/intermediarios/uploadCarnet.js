const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       
        const subCarpeta = file.fieldname === 'voucher' ? 'vouchers' : 'carnets';

        const dir = path.join(process.cwd(), 'uploads', subCarpeta);
        if (!fs.existsSync(dir)) {
            console.log(`Creando directorio: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const prefijo = file.fieldname === 'voucher' ? 'PAGO-' : 'CARNET-';
        const uniqueName = `${prefijo}${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;