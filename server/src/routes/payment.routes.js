const express = require('express');
const router = express.Router();
router.post('/', (req, res) => res.send('Payment Routes'));
module.exports = router;
