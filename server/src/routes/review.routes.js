const express = require('express');
const router = express.Router();
const {
    addReview,
    getFoodReviews,
    getMyReviews,
    deleteReview
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/food/:foodId', getFoodReviews);

// Private
router.post('/', protect, addReview);
router.get('/me', protect, getMyReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
