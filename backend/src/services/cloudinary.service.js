const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

const isCloudinaryConfigured = () => {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

const saveToLocalDisk = async (file, folder) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const uploadDir = path.join(__dirname, '../../public/uploads', folder);
    
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, filename);
    await fs.promises.writeFile(fullPath, file.buffer);

    return {
        secure_url: `/uploads/${folder}/${filename}`,
        url: `/uploads/${folder}/${filename}`,
        public_id: filename
    };
};

const uploadBuffer = async (file, options = {}) => {
    if (!file || !file.buffer) {
        throw new Error('No file buffer provided');
    }

    const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'food-delivery';

    if (!isCloudinaryConfigured()) {
        return saveToLocalDisk(file, folder);
    }

    try {
        return await new Promise((resolve, reject) => {
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
    } catch (err) {
        // Fallback to local disk if Cloudinary fails (e.g. rate limit, network down)
        console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
        return saveToLocalDisk(file, folder);
    }
};

module.exports = {
    uploadBuffer,
    destroyByPublicId: async (publicId) => {
        if (!publicId) return null;
        if (isCloudinaryConfigured()) {
            return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        }
        return null;
    }
};

