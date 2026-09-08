const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'comercio_pachacamac',
    allowed_formats: ['jpg', 'png', 'jpeg'], 
    resource_type: 'image',
    public_id: (req, file) => `doc-${Date.now()}`
  },
});

module.exports = { cloudinary, storage };