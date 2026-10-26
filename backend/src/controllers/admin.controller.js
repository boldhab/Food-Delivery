const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const normalizeUser = (user) => {
    if (!user) return null;
    return {
        ...user,
        _id: user.id,
        address: {
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
        }
    };
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role = 'user', address = {}, driverProfile } = req.body || {};

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

        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const created = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                phone: phone.trim(),
                role,
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
                isActive: true,
                driverProfile: role === 'driver' ? {
                    create: {
                        vehicleType: driverProfile?.vehicleType || '',
                        plateNumber: driverProfile?.plateNumber || '',
                        licenseNumber: driverProfile?.licenseNumber || ''
                    }
                } : undefined,
                cart: role === 'user' ? {
                    create: { subtotal: 0, totalItems: 0 }
                } : undefined
            },
            include: { driverProfile: true }
        });

        res.status(201).json({
            success: true,
            message: `${role} account created successfully`,
            data: normalizeUser(created),
            credentials: {
                username: created.email
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        next(error);
    }
};

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

        const where = {};
        if (role) where.role = role;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const orderBy = {};
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    street: true,
                    city: true,
                    state: true,
                    zipCode: true,
                    isActive: true,
                    createdAt: true,
                    driverProfile: true,
                    customerOrders: {
                        select: {
                            id: true,
                            totalAmount: true,
                            createdAt: true
                        }
                    }
                },
                orderBy,
                skip,
                take: Number(limit)
            }),
            prisma.user.count({ where })
        ]);

        const usersWithStats = users.map((user) => {
            const orders = user.customerOrders || [];
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            const lastOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;

            return {
                ...normalizeUser(user),
                stats: {
                    totalOrders,
                    totalSpent,
                    lastOrderDate
                }
            };
        });

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalUsers,
                    pages: Math.ceil(totalUsers / Number(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                street: true,
                city: true,
                state: true,
                zipCode: true,
                isActive: true,
                createdAt: true,
                driverProfile: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const orders = await prisma.order.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        res.json({
            success: true,
            data: {
                user: normalizeUser(user),
                orders: orders.map((o) => ({ ...o, _id: o.id })),
                stats: {
                    totalOrders,
                    totalSpent,
                    avgOrderValue
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const updated = await prisma.user.update({
            where: { id },
            data: { isActive: Boolean(isActive) }
        });

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: updated.isActive }
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
