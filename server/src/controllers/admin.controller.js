const User = require('../models/User');
const Order = require('../models/Order');

/**
 * @desc    Create user/driver/admin by admin
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role = 'user', address, driverProfile } = req.body || {};

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'name, email, password and phone are required'
            });
        }

        if (!['user', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const created = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            phone: phone.trim(),
            role,
            address,
            driverProfile: role === 'driver' ? {
                vehicleType: driverProfile?.vehicleType || '',
                plateNumber: driverProfile?.plateNumber || '',
                licenseNumber: driverProfile?.licenseNumber || '',
                emergencyContact: driverProfile?.emergencyContact || ''
            } : undefined
        });

        res.status(201).json({
            success: true,
            message: `${role} account created successfully`,
            data: {
                _id: created._id,
                name: created.name,
                email: created.email,
                phone: created.phone,
                role: created.role,
                isActive: created.isActive,
                driverProfile: created.driverProfile
            },
            credentials: {
                username: created.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        next(error);
    }
};

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
    createUser,
    getAllUsers,
    getUserDetails,
    updateUserStatus
};
