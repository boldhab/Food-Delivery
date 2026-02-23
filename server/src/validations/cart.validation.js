const { body, param } = require('express-validator');

const addToCartRules = [
    body('foodId')
        .isMongoId()
        .withMessage('foodId must be a valid Mongo ID'),
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('quantity must be between 1 and 20')
];

const updateCartItemRules = [
    param('itemId')
        .isMongoId()
        .withMessage('itemId must be a valid Mongo ID'),
    body('quantity')
        .isInt({ min: 1, max: 20 })
        .withMessage('quantity must be between 1 and 20')
];

const removeCartItemRules = [
    param('itemId')
        .isMongoId()
        .withMessage('itemId must be a valid Mongo ID')
];

module.exports = {
    addToCartRules,
    updateCartItemRules,
    removeCartItemRules
};
