const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026_production_grade',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = generateToken;