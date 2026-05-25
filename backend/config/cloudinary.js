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
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    // Do NOT include transformation here — it breaks signed uploads (Invalid Signature).
  }
});

module.exports = {
  cloudinary,
  storage
};
