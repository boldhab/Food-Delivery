const Notification = require('../models/Notification');

const getMyNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [items, unreadCount] = await Promise.all([
            Notification.find({ recipient: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            Notification.countDocuments({ recipient: req.user._id, read: false })
        ]);

        res.json({
            success: true,
            data: {
                notifications: items,
                unreadCount
            }
        });
    } catch (error) {
        next(error);
    }
};

const markNotificationRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );

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
