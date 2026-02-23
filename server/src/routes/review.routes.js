const express = require('express');
const router = express.Router();
const {
    addReview,
    getFoodReviews,
    getMyReviews,
    deleteReview
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    addReviewRules,
    foodReviewsRules,
    deleteReviewRules
} = require('../validations/review.validation');

// Public
router.get('/food/:foodId', foodReviewsRules, validate, getFoodReviews);

// Private
router.post('/', protect, addReviewRules, validate, addReview);
router.get('/me', protect, getMyReviews);
router.delete('/:id', protect, deleteReviewRules, validate, deleteReview);

module.exports = router;
