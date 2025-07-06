const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dzt81z6bm',
  api_key: '853955116611695',
  api_secret: '9Hjtlcqq3Rv6Y-_jgJxR42nqS8o',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-blog', // You can change this folder name
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

module.exports = { cloudinary, storage };