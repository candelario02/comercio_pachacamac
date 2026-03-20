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
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    public_id: (req, file) => `doc-${Date.now()}` 
  },
});

module.exports = { cloudinary, storage };