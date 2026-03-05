const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        type: {
            type: String,
            enum: ['percent', 'fixed'],
            default: 'percent'
        },
        value: {
            type: Number,
            default: 0
        },
        minOrderAmount: {
            type: Number,
            default: 0
        },
        maxUses: {
            type: Number,
            default: null
        },
        usedCount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        bannerImage: {
            type: String,
            default: ''
        },
        ctaLabel: {
            type: String,
            default: ''
        },
        ctaLink: {
            type: String,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1, createdAt: -1 });

module.exports = mongoose.model('Promotion', promotionSchema);
