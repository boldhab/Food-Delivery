const prisma = require('../config/prisma');

const updateFoodRating = async (foodId) => {
    const stats = await prisma.review.aggregate({
        where: { foodId },
        _avg: { rating: true },
        _count: true
    });

    const averageRating = stats._avg.rating || 0;
    const reviewCount = stats._count || 0;

    await prisma.food.update({
        where: { id: foodId },
        data: {
            rating: Math.round(averageRating * 10) / 10,
            numReviews: reviewCount
        }
    });
};

const normalizeReview = (r) => {
    if (!r) return null;
    return {
        ...r,
        _id: r.id,
        user: r.user ? { ...r.user, _id: r.user.id } : r.userId,
        food: r.food ? { ...r.food, _id: r.food.id } : r.foodId
    };
};

const addReview = async (req, res, next) => {
    try {
        const { foodId, rating, comment } = req.body || {};
        const userId = req.user.id || req.user._id;

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

        const food = await prisma.food.findUnique({ where: { id: foodId } });
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        const review = await prisma.review.upsert({
            where: {
                userId_foodId: {
                    userId,
                    foodId
                }
            },
            update: {
                rating: Number(rating),
                comment: comment || ''
            },
            create: {
                userId,
                foodId,
                rating: Number(rating),
                comment: comment || ''
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        await updateFoodRating(foodId);

        res.status(201).json({
            success: true,
            message: 'Review saved successfully',
            data: normalizeReview(review)
        });
    } catch (error) {
        next(error);
    }
};

const getFoodReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { foodId: req.params.foodId },
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.review.count({ where: { foodId: req.params.foodId } })
        ]);

        res.json({
            success: true,
            count: reviews.length,
            total,
            data: reviews.map(normalizeReview)
        });
    } catch (error) {
        next(error);
    }
};

const getMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const reviews = await prisma.review.findMany({
            where: { userId },
            include: { food: { select: { id: true, name: true, image: true, price: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: reviews.length,
            data: reviews.map(normalizeReview)
        });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { rating, comment } = req.body || {};

        const review = await prisma.review.findUnique({ where: { id: req.params.id } });
        if (!review || review.userId !== userId) {
            return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
        }

        const updated = await prisma.review.update({
            where: { id: req.params.id },
            data: {
                rating: rating !== undefined ? Number(rating) : review.rating,
                comment: comment !== undefined ? comment : review.comment
            },
            include: { user: { select: { id: true, name: true } } }
        });

        await updateFoodRating(review.foodId);

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: normalizeReview(updated)
        });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const review = await prisma.review.findUnique({ where: { id: req.params.id } });

        if (!review || (review.userId !== userId && req.user.role !== 'admin')) {
            return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
        }

        await prisma.review.delete({ where: { id: req.params.id } });
        await updateFoodRating(review.foodId);

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
    updateReview,
    deleteReview
};
