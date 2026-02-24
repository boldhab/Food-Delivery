const cloudinary = require('../config/cloudinary');

const uploadBuffer = (file, options = {}) => {
    if (!file || !file.buffer) {
        throw new Error('No file buffer provided');
    }

    const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'food-delivery';

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );

        stream.end(file.buffer);
    });
};

module.exports = {
    uploadBuffer,
    destroyByPublicId: async (publicId) => {
        if (!publicId) return null;
        return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }
};
