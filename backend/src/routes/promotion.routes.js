const express = require('express');
const router = express.Router();
const { getActivePromotions, validatePromotion } = require('../controllers/promotion.controller');

router.get('/active', getActivePromotions);
router.post('/validate', validatePromotion);

module.exports = router;
