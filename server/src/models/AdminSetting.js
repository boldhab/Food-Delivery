const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: 'admin',
            unique: true,
            index: true
        },
        general: {
            businessName: { type: String, default: 'Food Delivery' },
            supportEmail: { type: String, default: 'support@example.com' },
            supportPhone: { type: String, default: '+1 000 000 0000' },
            timezone: { type: String, default: 'UTC' },
            currency: { type: String, default: 'USD' }
        },
        payment: {
            taxRate: { type: Number, default: 8 },
            deliveryFee: { type: Number, default: 2.5 },
            minimumOrder: { type: Number, default: 10 },
            allowCashOnDelivery: { type: Boolean, default: true },
            autoCapturePayments: { type: Boolean, default: false }
        },
        notifications: {
            emailOnNewOrder: { type: Boolean, default: true },
            emailOnCancelledOrder: { type: Boolean, default: true },
            smsOnNewOrder: { type: Boolean, default: false },
            pushOnDriverAssigned: { type: Boolean, default: true },
            dailySummary: { type: Boolean, default: true }
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
