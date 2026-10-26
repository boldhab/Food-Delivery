const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    street: true,
                    city: true,
                    state: true,
                    zipCode: true,
                    isActive: true,
                    driverProfile: true
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account deactivated'
                });
            }

            // Provide backward compatibility with Mongoose _id
            user._id = user.id;
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

const driver = (req, res, next) => {
    if (req.user && req.user.role === 'driver') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as driver'
        });
    }
};

module.exports = { protect, admin, driver };
