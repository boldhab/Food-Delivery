const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.send('Food Routes'));
module.exports = router;
