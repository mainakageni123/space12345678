const multer = require('multer');
const { uploadBuffer } = require('../config/cloudinary');

const IMAGE_MIME = /^image\/(jpeg|jpg|png|gif|webp)$/i;

const multerMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_MIME.test(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, GIF, and WEBP images are allowed'));
    }
    cb(null, true);
  }
});

async function uploadFilesToCloudinary(req, res, next) {
  const files = req.files?.length
    ? req.files
    : req.file
      ? [req.file]
      : [];

  if (!files.length) return next();

  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const result = await uploadBuffer(file.buffer);
        return {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes
        };
      })
    );
    req.files = uploaded;
    if (uploaded.length === 1) req.file = uploaded[0];
    next();
  } catch (err) {
    next(err);
  }
}

/** Accept images[] (up to 10) or single image field */
function multiImageUpload(req, res, next) {
  multerMemory.array('images', 10)(req, res, (err) => {
    if (err) return next(err);
    if (req.files?.length) return uploadFilesToCloudinary(req, res, next);
    multerMemory.single('image')(req, res, (err2) => {
      if (err2) return next(err2);
      uploadFilesToCloudinary(req, res, next);
    });
  });
}

function singleImageUpload(req, res, next) {
  multerMemory.single('image')(req, res, (err) => {
    if (err) return next(err);
    uploadFilesToCloudinary(req, res, next);
  });
}

module.exports = { multiImageUpload, singleImageUpload };
