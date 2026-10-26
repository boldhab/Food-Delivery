const prisma = require('../config/prisma');

/**
 * @desc    Get single food item for admin
 * @route   GET /api/admin/foods/:id
 * @access  Private/Admin
 */
const getFoodByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const food = await prisma.food.findUnique({
            where: { id }
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...food,
                _id: food.id
            }
        });
    } catch (error) {
        next(error);
    }
};

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
        const where = {};
        if (category) where.category = category;
        if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Pagination
        const take = Math.max(1, parseInt(limit));
        const skip = (Math.max(1, parseInt(page)) - 1) * take;
        
        // Sorting
        const validSortFields = ['name', 'price', 'category', 'createdAt', 'rating'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const orderBy = { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' };

        // Get foods and count
        const [foods, totalFoods] = await Promise.all([
            prisma.food.findMany({
                where,
                skip,
                take,
                orderBy
            }),
            prisma.food.count({ where })
        ]);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get sales stats for each food
        const foodsWithStats = await Promise.all(
            foods.map(async (food) => {
                const orderItems = await prisma.orderItem.findMany({
                    where: { foodId: food.id }
                });

                const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalRevenue = orderItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
                const orderCount = orderItems.length;

                const recentOrders = await prisma.orderItem.count({
                    where: {
                        foodId: food.id,
                        order: {
                            createdAt: { gte: oneWeekAgo }
                        }
                    }
                });

                return {
                    ...food,
                    _id: food.id,
                    stats: {
                        totalQuantity,
                        totalRevenue,
                        orderCount
                    },
                    inventoryAlert: recentOrders < 5 && food.isAvailable
                };
            })
        );

        res.json({
            success: true,
            data: {
                foods: foodsWithStats,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total: totalFoods,
                    pages: Math.ceil(totalFoods / take) || 1
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

        // Fetch all foods
        const foods = await prisma.food.findMany({
            orderBy: { name: 'asc' }
        });

        // Group orderItems by foodId in the last 7 days
        const recentOrderStats = await prisma.orderItem.groupBy({
            by: ['foodId'],
            where: {
                order: {
                    createdAt: { gte: oneWeekAgo },
                    orderStatus: { not: 'cancelled' }
                }
            },
            _count: { _all: true },
            _sum: { quantity: true, totalPrice: true }
        });

        const statsMap = {};
        for (const item of recentOrderStats) {
            if (item.foodId) {
                statsMap[item.foodId] = {
                    recentOrders: item._count._all || 0,
                    recentQuantity: item._sum.quantity || 0,
                    recentRevenue: item._sum.totalPrice || 0
                };
            }
        }

        const itemsWithVelocity = foods.map((food) => {
            const stat = statsMap[food.id] || { recentOrders: 0, recentQuantity: 0, recentRevenue: 0 };
            const stockQty = Number(food.stockQuantity ?? 50);
            const lowThreshold = Number(food.lowStockThreshold ?? 10);
            const isTracked = food.trackStock ?? true;

            let status = 'In Stock';
            if (!food.isAvailable || (isTracked && stockQty <= 0)) {
                status = 'Out of Stock';
            } else if (isTracked && stockQty <= lowThreshold) {
                status = 'Low Stock';
            } else if (stat.recentOrders >= 10) {
                status = 'High Demand';
            } else if (stat.recentOrders < 3) {
                status = 'Low Velocity';
            }

            return {
                foodId: food.id,
                _id: food.id,
                name: food.name,
                category: food.category,
                price: food.price,
                isAvailable: food.isAvailable && (!isTracked || stockQty > 0),
                trackStock: isTracked,
                stockQuantity: stockQty,
                lowStockThreshold: lowThreshold,
                dailyQuota: food.dailyQuota ?? 50,
                orderCount: stat.recentOrders,
                quantity: stat.recentQuantity,
                current: isTracked ? stockQty : stat.recentQuantity,
                threshold: lowThreshold,
                revenue: Number(stat.recentRevenue.toFixed(2)),
                rating: food.rating,
                status,
                image: food.image
            };
        });

        const outOfStockItems = itemsWithVelocity.filter((f) => !f.isAvailable || f.stockQuantity <= 0);
        const lowStockItems = itemsWithVelocity.filter((f) => f.isAvailable && f.stockQuantity > 0 && f.stockQuantity <= f.lowStockThreshold);
        const lowVelocityItems = itemsWithVelocity.filter((f) => f.isAvailable && f.orderCount < 3);
        const highDemandItems = itemsWithVelocity.filter((f) => f.isAvailable && f.orderCount >= 10);

        // Alerts consist of out-of-stock and low-stock items
        const alerts = itemsWithVelocity.filter((f) => !f.isAvailable || f.stockQuantity <= f.lowStockThreshold);

        res.json({
            success: true,
            data: {
                alerts,
                items: itemsWithVelocity,
                summary: {
                    totalMenuItems: foods.length,
                    activeItems: foods.filter((f) => f.isAvailable && f.stockQuantity > 0).length,
                    outOfStockCount: outOfStockItems.length,
                    lowStockCount: lowStockItems.length,
                    lowVelocityCount: lowVelocityItems.length,
                    highDemandCount: highDemandItems.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update food inventory stock and thresholds
 * @route   PUT /api/admin/foods/:id/stock
 * @access  Private/Admin
 */
const updateFoodStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { stockQuantity, trackStock, lowStockThreshold, isAvailable, dailyQuota } = req.body;

        const updateData = {};
        if (stockQuantity !== undefined) updateData.stockQuantity = Math.max(0, parseInt(stockQuantity, 10));
        if (trackStock !== undefined) updateData.trackStock = Boolean(trackStock);
        if (lowStockThreshold !== undefined) updateData.lowStockThreshold = Math.max(0, parseInt(lowStockThreshold, 10));
        if (dailyQuota !== undefined) updateData.dailyQuota = Math.max(0, parseInt(dailyQuota, 10));
        if (isAvailable !== undefined) {
            updateData.isAvailable = Boolean(isAvailable);
        } else if (stockQuantity !== undefined) {
            updateData.isAvailable = Number(stockQuantity) > 0;
        }

        const updated = await prisma.food.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Food inventory stock updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFoodByIdAdmin,
    getFoodsWithStats,
    getInventoryAlerts,
    updateFoodStock
};
