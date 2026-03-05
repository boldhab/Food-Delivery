const { body, param } = require('express-validator');

const promotionIdParamRules = [
    param('id')
        .isMongoId()
        .withMessage('id must be a valid Mongo ID')
];

const promotionBodyRules = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('code is required'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('title is required'),
    body('type')
        .optional()
        .isIn(['percent', 'fixed'])
        .withMessage('type is invalid'),
    body('value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('value must be a number >= 0'),
    body('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('minOrderAmount must be a number >= 0'),
    body('maxUses')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('maxUses must be an integer >= 1'),
    body('startDate')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('startDate must be a valid date'),
    body('endDate')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('endDate must be a valid date'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
];

const createPromotionRules = promotionBodyRules;
const updatePromotionRules = [...promotionIdParamRules, ...promotionBodyRules];
const deletePromotionRules = promotionIdParamRules;

module.exports = {
    createPromotionRules,
    updatePromotionRules,
    deletePromotionRules
};
