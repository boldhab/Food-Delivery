const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.send('Review Routes'));
module.exports = router;
