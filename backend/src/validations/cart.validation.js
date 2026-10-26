const { body, param } = require('express-validator');

const addToCartRules = [
    body('foodId')
        .isUUID()
        .withMessage('foodId must be a valid UUID'),
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('quantity must be between 1 and 20')
];

const updateCartItemRules = [
    param('itemId')
        .isUUID()
        .withMessage('itemId must be a valid UUID'),
    body('quantity')
        .isInt({ min: 1, max: 20 })
        .withMessage('quantity must be between 1 and 20')
];

const removeCartItemRules = [
    param('itemId')
        .isUUID()
        .withMessage('itemId must be a valid UUID')
];

module.exports = {
    addToCartRules,
    updateCartItemRules,
    removeCartItemRules
};
