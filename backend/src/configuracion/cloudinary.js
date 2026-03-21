const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'drkrsfxlc',
  api_key: '794681911483515',
  api_secret: 'gespZqLZetHtthHRJdm7354hdIE' 
});



const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'comercio_pachacamac',
    // 'auto' es fundamental para que el navegador sepa que es un PDF
    resource_type: 'auto', 
    // NO uses public_id personalizado por ahora para evitar conflictos con la extensión
    // Cloudinary le pondrá el nombre y la extensión .pdf automáticamente
  },
});




module.exports = { cloudinary, storage };