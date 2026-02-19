const express = require('express');
const router = express.Router();

// To be implemented
router.post('/create-payment-intent', (req, res) => {
    res.json({ message: 'Create payment intent - To be implemented' });
});

router.post('/webhook', (req, res) => {
    res.json({ message: 'Stripe webhook - To be implemented' });
});

module.exports = router;