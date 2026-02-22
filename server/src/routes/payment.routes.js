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

router.post('/webhook', handleWebhook);

router.use(protect);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/methods', getPaymentMethods);
router.post('/methods', addPaymentMethod);
router.delete('/methods/:id', removePaymentMethod);

module.exports = router;
