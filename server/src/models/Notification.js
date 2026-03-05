const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        link: {
            type: String,
            default: '/admin'
        },
        read: {
            type: Boolean,
            default: false
        },
        metadata: {
            type: Object,
            default: {}
        }
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
