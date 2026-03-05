const express = require('express');
const router = express.Router();
const { getActivePromotions } = require('../controllers/promotion.controller');

router.get('/active', getActivePromotions);

module.exports = router;
