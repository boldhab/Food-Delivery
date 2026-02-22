const Food = require('../models/food.model');
const Order = require('../models/order.model');

/**
 * @desc    Get all foods with sales stats (Admin)
 * @route   GET /api/admin/foods
 * @access  Private/Admin
 */
const getFoodsWithStats = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            isAvailable,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (category) query.category = category;
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get foods
        const foods = await Food.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get sales stats for each food
        const foodsWithStats = await Promise.all(
            foods.map(async (food) => {
                const salesStats = await Order.aggregate([
                    { $unwind: '$items' },
                    { $match: { 'items.foodId': food._id } },
                    {
                        $group: {
                            _id: null,
                            totalQuantity: { $sum: '$items.quantity' },
                            totalRevenue: { $sum: '$items.totalPrice' },
                            orderCount: { $sum: 1 }
                        }
                    }
                ]);

                // Check inventory alert (less than 5 orders in last week)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const recentOrders = await Order.countDocuments({
                    'items.foodId': food._id,
                    createdAt: { $gte: oneWeekAgo }
                });

                return {
                    ...food.toObject(),
                    stats: salesStats[0] || {
                        totalQuantity: 0,
                        totalRevenue: 0,
                        orderCount: 0
                    },
                    inventoryAlert: recentOrders < 5 && food.isAvailable
                };
            })
        );

        const totalFoods = await Food.countDocuments(query);

        res.json({
            success: true,
            data: {
                foods: foodsWithStats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalFoods,
                    pages: Math.ceil(totalFoods / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get low stock / inventory alerts (Admin)
 * @route   GET /api/admin/foods/alerts
 * @access  Private/Admin
 */
const getInventoryAlerts = async (req, res, next) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Find foods with low recent orders
        const lowPerformingFoods = await Order.aggregate([
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.foodId',
                    name: { $first: '$items.name' },
                    orderCount: { $sum: 1 },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $match: { orderCount: { $lt: 3 } } },
            { $sort: { orderCount: 1 } }
        ]);

        // Get food details for alerts
        const alerts = await Promise.all(
            lowPerformingFoods.map(async (item) => {
                const food = await Food.findById(item._id);
                return {
                    foodId: item._id,
                    name: item.name,
                    orderCount: item.orderCount,
                    quantity: item.quantity,
                    isAvailable: food?.isAvailable,
                    category: food?.category,
                    image: food?.image
                };
            })
        );

        res.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFoodsWithStats,
    getInventoryAlerts
};