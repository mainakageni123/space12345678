const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-hire',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [
      { width: 1000, crop: 'limit' },
      { fetch_format: 'auto' },
      { quality: 'auto' }
    ]
  }
});

module.exports = {
  cloudinary,
  storage
};
