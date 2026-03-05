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

const normalizeSettings = (incoming = {}) => {
    const merged = mergeSettings(incoming);
    return {
        general: {
            businessName: String(merged.general.businessName || DEFAULT_SETTINGS.general.businessName).trim(),
            supportEmail: String(merged.general.supportEmail || DEFAULT_SETTINGS.general.supportEmail).trim(),
            supportPhone: String(merged.general.supportPhone || DEFAULT_SETTINGS.general.supportPhone).trim(),
            timezone: String(merged.general.timezone || DEFAULT_SETTINGS.general.timezone).trim(),
            currency: String(merged.general.currency || DEFAULT_SETTINGS.general.currency).trim().toUpperCase()
        },
        payment: {
            taxRate: Number(merged.payment.taxRate),
            deliveryFee: Number(merged.payment.deliveryFee),
            minimumOrder: Number(merged.payment.minimumOrder),
            allowCashOnDelivery: Boolean(merged.payment.allowCashOnDelivery),
            autoCapturePayments: Boolean(merged.payment.autoCapturePayments)
        },
        notifications: {
            emailOnNewOrder: Boolean(merged.notifications.emailOnNewOrder),
            emailOnCancelledOrder: Boolean(merged.notifications.emailOnCancelledOrder),
            smsOnNewOrder: Boolean(merged.notifications.smsOnNewOrder),
            pushOnDriverAssigned: Boolean(merged.notifications.pushOnDriverAssigned),
            dailySummary: Boolean(merged.notifications.dailySummary)
        }
    };
};

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
        const existing = await AdminSetting.findOne({ key: 'admin' }).lean();
        const merged = {
            general: {
                ...DEFAULT_SETTINGS.general,
                ...(existing?.general || {}),
                ...(req.body?.general || {})
            },
            payment: {
                ...DEFAULT_SETTINGS.payment,
                ...(existing?.payment || {}),
                ...(req.body?.payment || {})
            },
            notifications: {
                ...DEFAULT_SETTINGS.notifications,
                ...(existing?.notifications || {}),
                ...(req.body?.notifications || {})
            }
        };
        const payload = normalizeSettings(merged);

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
            data: normalizeSettings(updated)
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAdminSettings,
    updateAdminSettings
};
