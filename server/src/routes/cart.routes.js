const express = require('express');
const router = express.Router();

// To be implemented
router.get('/', (req, res) => {
    res.json({ message: 'Get cart - To be implemented' });
});

router.post('/add', (req, res) => {
    res.json({ message: 'Add to cart - To be implemented' });
});

router.put('/update/:itemId', (req, res) => {
    res.json({ message: 'Update cart item - To be implemented' });
});

router.delete('/remove/:itemId', (req, res) => {
    res.json({ message: 'Remove from cart - To be implemented' });
});

router.delete('/clear', (req, res) => {
    res.json({ message: 'Clear cart - To be implemented' });
});

module.exports = router;