const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (!file || !file.mimetype) {
        return cb(null, false);
    }

    if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }

    const err = new Error('Only image files are allowed');
    err.statusCode = 400;
    return cb(err);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;
