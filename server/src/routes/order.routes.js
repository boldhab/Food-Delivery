const express = require('express');
const router = express.Router();

// To be implemented
router.post('/', (req, res) => {
    res.json({ message: 'Create order - To be implemented' });
});

router.get('/my-orders', (req, res) => {
    res.json({ message: 'Get my orders - To be implemented' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Get single order - To be implemented' });
});

router.put('/:id/cancel', (req, res) => {
    res.json({ message: 'Cancel order - To be implemented' });
});

// Admin only
router.get('/admin/all', (req, res) => {
    res.json({ message: 'Admin get all orders - To be implemented' });
});

router.put('/admin/:id/status', (req, res) => {
    res.json({ message: 'Admin update status - To be implemented' });
});

module.exports = router;