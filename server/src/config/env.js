const looksLikePlaceholder = (value) => {
    if (!value) return true;
    const normalized = String(value).trim().toLowerCase();
    return (
        normalized.length < 8 ||
        normalized.includes('your_') ||
        normalized.includes('changeme') ||
        normalized.includes('example') ||
        normalized.includes('localhost') ||
        normalized.includes('test')
    );
};

const getCorsOrigins = () => {
    const raw = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '';
    return raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const validateEnvironment = () => {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.NODE_ENV === 'production') {
        const missingProd = [
            'CORS_ORIGINS',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET'
        ].filter((key) => !process.env[key]);

        if (missingProd.length) {
            throw new Error(
                `Missing production environment variables: ${missingProd.join(', ')}`
            );
        }

        const origins = getCorsOrigins();
        if (!origins.length) {
            throw new Error('CORS_ORIGINS must include at least one trusted production domain.');
        }

        const weakSecrets = ['JWT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
            .filter((key) => looksLikePlaceholder(process.env[key]));

        if (weakSecrets.length) {
            throw new Error(
                `Production secrets look unsafe/placeholders: ${weakSecrets.join(', ')}`
            );
        }
    }
};

module.exports = {
    validateEnvironment
};
