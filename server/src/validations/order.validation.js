const { body, param, query } = require('express-validator');

const placeOrderRules = [
    body('paymentMethod')
        .isIn(['cash_on_delivery', 'card', 'online'])
        .withMessage('paymentMethod is invalid'),
    body('deliveryAddress')
        .isObject()
        .withMessage('deliveryAddress is required'),
    body('deliveryAddress.street')
        .trim()
        .notEmpty()
        .withMessage('deliveryAddress.street is required'),
    body('deliveryAddress.city')
        .trim()
        .notEmpty()
        .withMessage('deliveryAddress.city is required'),
    body('deliveryAddress.state')
        .trim()
        .notEmpty()
        .withMessage('deliveryAddress.state is required'),
    body('deliveryAddress.zipCode')
        .trim()
        .notEmpty()
        .withMessage('deliveryAddress.zipCode is required'),
    body('specialInstructions')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('specialInstructions must be at most 500 characters')
];

const orderIdParamRules = [
    param('id')
        .isMongoId()
        .withMessage('id must be a valid Mongo ID')
];

const cancelOrderRules = [
    ...orderIdParamRules,
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('reason must be at most 200 characters')
];

const updateStatusRules = [
    ...orderIdParamRules,
    body('status')
        .isIn([
            'pending',
            'confirmed',
            'preparing',
            'out_for_delivery',
            'delivered',
            'complete',
            'completed',
            'cancelled',
            'canceled',
            'rejected'
        ])
        .withMessage('status is invalid'),
    body('note')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('note must be at most 200 characters')
];

const listOrdersQueryRules = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be an integer >= 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be between 1 and 100'),
    query('status')
        .optional()
        .isString()
        .withMessage('status must be a string')
];

module.exports = {
    placeOrderRules,
    orderIdParamRules,
    cancelOrderRules,
    updateStatusRules,
    listOrdersQueryRules
};
