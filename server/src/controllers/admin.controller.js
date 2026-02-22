const User = require('../models/user.model');
const Order = require('../models/order.model');

/**
 * @desc    Get all users with order stats (Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (role) query.role = role;
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get users
        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get order counts for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const orderStats = await Order.aggregate([
                    { $match: { user: user._id } },
                    {
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            totalSpent: { $sum: '$totalAmount' },
                            lastOrderDate: { $max: '$createdAt' }
                        }
                    }
                ]);

                return {
                    ...user.toObject(),
                    stats: orderStats[0] || {
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrderDate: null
                    }
                };
            })
        );

        const totalUsers = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalUsers,
                    pages: Math.ceil(totalUsers / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single user details (Admin)
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's order history
        const orders = await Order.find({ user: id })
            .sort({ createdAt: -1 })
            .limit(20);

        // Get user statistics
        const stats = await Order.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                    favouriteItems: { $addToSet: '$items.name' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                user,
                orders,
                stats: stats[0] || {
                    totalOrders: 0,
                    totalSpent: 0,
                    avgOrderValue: 0
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user status (Admin)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserDetails,
    updateUserStatus
};