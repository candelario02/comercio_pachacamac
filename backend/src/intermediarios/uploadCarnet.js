const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Creamos una ruta absoluta para evitar problemas de contexto
        const dir = path.join(__dirname, '../../uploads/carnets');
        
        // Si no existe la carpeta, la crea de forma recursiva
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nombre único con timestamp para evitar colisiones
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;