// Centralized error middleware with friendly status mapping.
module.exports = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    if (err.statusCode && Number.isInteger(err.statusCode)) {
        statusCode = err.statusCode;
    }

    // Mongoose validation errors (missing/invalid fields)
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }

    // Multer upload errors
    if (err.name === 'MulterError') {
        statusCode = 400;
    }

    // Invalid Mongo ObjectId format
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Prisma duplicate key error (unique constraint violation)
    if (err.code === 'P2002') {
        statusCode = 409;
        const target = Array.isArray(err.meta?.target)
            ? err.meta.target.join(', ')
            : err.meta?.target || 'field';
        message = `A record with this ${target} already exists`;
    }

    // Duplicate key error (MongoDB legacy)
    if (err.code === 11000) {
        statusCode = 409;
        const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
        message = `${duplicatedField} already exists`;
    }

    // JWT related errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Not authorized, token invalid or expired';
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};
