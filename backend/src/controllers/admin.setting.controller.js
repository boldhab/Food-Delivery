const prisma = require('../config/prisma');

const DEFAULT_SETTINGS = {
    general: {
        businessName: 'Food Delivery',
        supportEmail: 'support@example.com',
        supportPhone: '+251 91 100 0001',
        timezone: 'Africa/Addis_Ababa',
        currency: 'ETB'
    },
    payment: {
        taxRate: 15,
        deliveryFee: 80,
        minimumOrder: 200,
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
        let setting = await prisma.adminSetting.findUnique({
            where: { key: 'admin' }
        });

        if (!setting) {
            setting = await prisma.adminSetting.create({
                data: {
                    key: 'admin',
                    general: DEFAULT_SETTINGS.general,
                    payment: DEFAULT_SETTINGS.payment,
                    notifications: DEFAULT_SETTINGS.notifications
                }
            });
        }

        const normalized = normalizeSettings(setting);
        res.json({
            success: true,
            data: {
                ...normalized,
                updatedAt: setting.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateAdminSettings = async (req, res, next) => {
    try {
        const payload = normalizeSettings(req.body);
        const adminId = req.user?.id || req.user?._id || null;

        const updated = await prisma.adminSetting.upsert({
            where: { key: 'admin' },
            update: {
                general: payload.general,
                payment: payload.payment,
                notifications: payload.notifications,
                updatedById: adminId
            },
            create: {
                key: 'admin',
                general: payload.general,
                payment: payload.payment,
                notifications: payload.notifications,
                updatedById: adminId
            }
        });

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                ...normalizeSettings(updated),
                updatedAt: updated.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

const resetAdminSettings = async (req, res, next) => {
    try {
        const adminId = req.user?.id || req.user?._id || null;
        const updated = await prisma.adminSetting.upsert({
            where: { key: 'admin' },
            update: {
                general: DEFAULT_SETTINGS.general,
                payment: DEFAULT_SETTINGS.payment,
                notifications: DEFAULT_SETTINGS.notifications,
                updatedById: adminId
            },
            create: {
                key: 'admin',
                general: DEFAULT_SETTINGS.general,
                payment: DEFAULT_SETTINGS.payment,
                notifications: DEFAULT_SETTINGS.notifications,
                updatedById: adminId
            }
        });

        res.json({
            success: true,
            message: 'Settings reset to default values',
            data: {
                ...normalizeSettings(updated),
                updatedAt: updated.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminSettings,
    updateAdminSettings,
    resetAdminSettings
};
