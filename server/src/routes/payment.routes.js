const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod
} = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const {
    createPaymentIntentRules,
    confirmPaymentRules,
    addPaymentMethodRules,
    removePaymentMethodRules
} = require('../validations/payment.validation');

router.post('/webhook', handleWebhook);

router.use(protect);

router.post('/create-payment-intent', createPaymentIntentRules, validate, createPaymentIntent);
router.post('/confirm', confirmPaymentRules, validate, confirmPayment);
router.get('/methods', getPaymentMethods);
router.post('/methods', addPaymentMethodRules, validate, addPaymentMethod);
router.delete('/methods/:id', removePaymentMethodRules, validate, removePaymentMethod);

module.exports = router;
