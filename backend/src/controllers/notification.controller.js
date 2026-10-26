const prisma = require('../config/prisma');

const normalizeNotification = (n) => {
    if (!n) return null;
    return {
        ...n,
        _id: n.id
    };
};

const getMyNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const userId = req.user.id || req.user._id;

        const [items, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { recipientId: userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit, 10)
            }),
            prisma.notification.count({
                where: { recipientId: userId, read: false }
            })
        ]);

        res.json({
            success: true,
            data: {
                notifications: items.map(normalizeNotification),
                unreadCount
            }
        });
    } catch (error) {
        next(error);
    }
};

const markNotificationRead = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const notification = await prisma.notification.findFirst({
            where: { id: req.params.id, recipientId: userId }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const updated = await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true }
        });

        res.json({
            success: true,
            data: normalizeNotification(updated)
        });
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsRead = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        await prisma.notification.updateMany({
            where: { recipientId: userId, read: false },
            data: { read: true }
        });

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
