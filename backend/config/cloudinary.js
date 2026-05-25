const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || 'car-hire';

/** Server-side upload — no client signature; avoids multer-storage-cloudinary signing bugs. */
function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  UPLOAD_FOLDER,
  uploadBuffer
};
