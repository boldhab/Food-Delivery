const AdminSetting = require('../models/AdminSetting');

const DEFAULT_SETTINGS = {
    general: {
        businessName: 'Food Delivery',
        supportEmail: 'support@example.com',
        supportPhone: '+1 000 000 0000',
        timezone: 'UTC',
        currency: 'USD'
    },
    payment: {
        taxRate: 8,
        deliveryFee: 2.5,
        minimumOrder: 10,
        allowCashOnDelivery: true,
        autoCapturePayments: false
    },
    notifications: {
        emailOnNewOrder: true,
        emailOnCancelledOrder: true,
        smsOnNewOrder: false,
        pushOnDriverAssigned: true,
        dailySummary: true
    }
};

const mergeSettings = (incoming = {}) => ({
    general: { ...DEFAULT_SETTINGS.general, ...(incoming.general || {}) },
    payment: { ...DEFAULT_SETTINGS.payment, ...(incoming.payment || {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(incoming.notifications || {}) }
});

const getAdminSettings = async (req, res, next) => {
    try {
        let settings = await AdminSetting.findOne({ key: 'admin' }).lean();

        if (!settings) {
            settings = await AdminSetting.create({ key: 'admin', ...DEFAULT_SETTINGS });
            settings = settings.toObject();
        }

        return res.json({
            success: true,
            data: mergeSettings(settings)
        });
    } catch (error) {
        return next(error);
    }
};

const updateAdminSettings = async (req, res, next) => {
    try {
        const payload = mergeSettings(req.body || {});

        const updated = await AdminSetting.findOneAndUpdate(
            { key: 'admin' },
            {
                $set: {
                    general: payload.general,
                    payment: payload.payment,
                    notifications: payload.notifications,
                    updatedBy: req.user?._id || null
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        return res.json({
            success: true,
            message: 'Settings updated successfully',
            data: mergeSettings(updated)
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAdminSettings,
    updateAdminSettings
};
