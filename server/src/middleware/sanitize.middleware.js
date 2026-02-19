const isObject = (value) => value !== null && typeof value === 'object';

const sanitizeInPlace = (target) => {
    if (Array.isArray(target)) {
        target.forEach((item) => sanitizeInPlace(item));
        return;
    }

    if (!isObject(target)) {
        return;
    }

    Object.keys(target).forEach((key) => {
        if (key.includes('$') || key.includes('.')) {
            delete target[key];
            return;
        }

        sanitizeInPlace(target[key]);
    });
};

const sanitizeRequest = (req, res, next) => {
    ['body', 'params', 'query'].forEach((field) => {
        if (isObject(req[field])) {
            sanitizeInPlace(req[field]);
        }
    });

    next();
};

module.exports = sanitizeRequest;
