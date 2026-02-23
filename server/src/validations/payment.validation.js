const { body, param } = require('express-validator');

const createPaymentIntentRules = [
    body('orderId')
        .isMongoId()
        .withMessage('orderId must be a valid Mongo ID')
];

const confirmPaymentRules = [
    body('paymentIntentId')
        .notEmpty()
        .withMessage('paymentIntentId is required')
];

const addPaymentMethodRules = [
    body('paymentMethodId')
        .notEmpty()
        .withMessage('paymentMethodId is required')
];

const removePaymentMethodRules = [
    param('id')
        .notEmpty()
        .withMessage('id is required')
];

module.exports = {
    createPaymentIntentRules,
    confirmPaymentRules,
    addPaymentMethodRules,
    removePaymentMethodRules
};
