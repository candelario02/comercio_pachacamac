const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'drkrsfxlc',
  api_key: '794681911483515',
  api_secret: 'gespZqLZetHtthHRJdm7354hdIE' 
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    
    const esPdf = file.mimetype === 'application/pdf';
    
    return {
      folder: 'comercio_pachacamac',
   
      resource_type: esPdf ? 'raw' : 'image', 
      public_id: `doc-${Date.now()}`,
      
    };
  },
});

module.exports = { cloudinary, storage };