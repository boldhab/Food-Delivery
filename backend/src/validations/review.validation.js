const { body, param, query } = require('express-validator');

const addReviewRules = [
    body('foodId')
        .isUUID()
        .withMessage('foodId must be a valid UUID'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('comment must be at most 1000 characters')
];

const foodReviewsRules = [
    param('foodId')
        .isUUID()
        .withMessage('foodId must be a valid UUID'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be an integer >= 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be between 1 and 100')
];

const deleteReviewRules = [
    param('id')
        .isUUID()
        .withMessage('id must be a valid UUID')
];

module.exports = {
    addReviewRules,
    foodReviewsRules,
    deleteReviewRules
};
