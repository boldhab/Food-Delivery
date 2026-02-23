const { body, param, query } = require('express-validator');

const addReviewRules = [
    body('foodId')
        .isMongoId()
        .withMessage('foodId must be a valid Mongo ID'),
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
        .isMongoId()
        .withMessage('foodId must be a valid Mongo ID'),
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
        .isMongoId()
        .withMessage('id must be a valid Mongo ID')
];

module.exports = {
    addReviewRules,
    foodReviewsRules,
    deleteReviewRules
};
