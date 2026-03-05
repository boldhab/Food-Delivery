const { body } = require('express-validator');

const updateAdminSettingsRules = [
    body('general')
        .optional()
        .isObject()
        .withMessage('general must be an object'),
    body('general.businessName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('general.businessName is required'),
    body('general.supportEmail')
        .optional()
        .isEmail()
        .withMessage('general.supportEmail must be a valid email'),
    body('general.supportPhone')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('general.supportPhone is required'),
    body('general.timezone')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('general.timezone is required'),
    body('general.currency')
        .optional()
        .trim()
        .isLength({ min: 3, max: 3 })
        .withMessage('general.currency must be a 3-letter code'),

    body('payment')
        .optional()
        .isObject()
        .withMessage('payment must be an object'),
    body('payment.taxRate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('payment.taxRate must be between 0 and 100'),
    body('payment.deliveryFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('payment.deliveryFee must be >= 0'),
    body('payment.minimumOrder')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('payment.minimumOrder must be >= 0'),
    body('payment.allowCashOnDelivery')
        .optional()
        .isBoolean()
        .withMessage('payment.allowCashOnDelivery must be boolean'),
    body('payment.autoCapturePayments')
        .optional()
        .isBoolean()
        .withMessage('payment.autoCapturePayments must be boolean'),

    body('notifications')
        .optional()
        .isObject()
        .withMessage('notifications must be an object'),
    body('notifications.emailOnNewOrder')
        .optional()
        .isBoolean()
        .withMessage('notifications.emailOnNewOrder must be boolean'),
    body('notifications.emailOnCancelledOrder')
        .optional()
        .isBoolean()
        .withMessage('notifications.emailOnCancelledOrder must be boolean'),
    body('notifications.smsOnNewOrder')
        .optional()
        .isBoolean()
        .withMessage('notifications.smsOnNewOrder must be boolean'),
    body('notifications.pushOnDriverAssigned')
        .optional()
        .isBoolean()
        .withMessage('notifications.pushOnDriverAssigned must be boolean'),
    body('notifications.dailySummary')
        .optional()
        .isBoolean()
        .withMessage('notifications.dailySummary must be boolean')
];

module.exports = {
    updateAdminSettingsRules
};
