const Review = require('../models/Review');
const Food = require('../models/Food');

/**
 * @desc    Add a review for a food item
 * @route   POST /api/reviews
 * @access  Private
 */
const addReview = async (req, res, next) => {
    try {
        const { foodId, rating, comment } = req.body || {};
        const userId = req.user._id;

        if (!foodId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'foodId and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'rating must be between 1 and 5'
            });
        }

        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        const review = await Review.create({
            user: userId,
            food: foodId,
            rating,
            comment
        });

        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already reviewed this item'
            });
        }
        next(error);
    }
};

/**
 * @desc    Get reviews for a food item
 * @route   GET /api/reviews/food/:foodId
 * @access  Public
 */
const getFoodReviews = async (req, res, next) => {
    try {
        const { foodId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ food: foodId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ food: foodId });

        const stats = await Review.aggregate([
            { $match: { food: Review.schema.path('food').cast(foodId) } },
            {
                $group: {
                    _id: '$food',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                stats: stats[0] || { averageRating: 0, reviewCount: 0 }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my reviews
 * @route   GET /api/reviews/me
 * @access  Private
 */
const getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('food', 'name image category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete review (owner or admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const isOwner = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.deleteOne();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addReview,
    getFoodReviews,
    getMyReviews,
    deleteReview
};
