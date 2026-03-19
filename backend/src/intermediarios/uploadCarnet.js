const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        let subCarpeta = 'carnets';
        if (file.fieldname === 'voucher') {
            subCarpeta = 'vouchers';
        }

        const dir = path.join(__dirname, `../../uploads/${subCarpeta}`);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        
        const prefijo = file.fieldname === 'voucher' ? 'PAGO-' : 'CARNET-';
        const uniqueName = prefijo + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;