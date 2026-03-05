const Promotion = require('../models/Promotion');

const normalizePromotionPayload = (payload = {}) => ({
    code: String(payload.code || '').trim().toUpperCase(),
    title: String(payload.title || '').trim(),
    description: String(payload.description || '').trim(),
    type: payload.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(payload.value || 0),
    minOrderAmount: Number(payload.minOrderAmount || 0),
    maxUses:
        payload.maxUses === '' || payload.maxUses === undefined || payload.maxUses === null
            ? null
            : Number(payload.maxUses),
    startDate: payload.startDate ? new Date(payload.startDate) : null,
    endDate: payload.endDate ? new Date(payload.endDate) : null,
    isActive: payload.isActive === undefined ? true : Boolean(payload.isActive),
    bannerImage: String(payload.bannerImage || '').trim(),
    ctaLabel: String(payload.ctaLabel || '').trim(),
    ctaLink: String(payload.ctaLink || '').trim()
});

const buildActivePromotionMatch = () => {
    const now = new Date();
    return {
        isActive: true,
        $and: [
            {
                $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }]
            },
            {
                $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }]
            }
        ]
    };
};

const getActivePromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find(buildActivePromotionMatch())
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: {
                promotions
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAdminPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find({})
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: {
                promotions
            }
        });
    } catch (error) {
        next(error);
    }
};

const createPromotion = async (req, res, next) => {
    try {
        const payload = normalizePromotionPayload(req.body);
        const exists = await Promotion.findOne({ code: payload.code });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: 'Promotion code already exists'
            });
        }

        const promotion = await Promotion.create({
            ...payload,
            createdBy: req.user?._id
        });

        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: promotion
        });
    } catch (error) {
        next(error);
    }
};

const updatePromotion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = normalizePromotionPayload(req.body);

        const existing = await Promotion.findById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }

        if (payload.code && payload.code !== existing.code) {
            const duplicate = await Promotion.findOne({ code: payload.code, _id: { $ne: id } });
            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Promotion code already exists'
                });
            }
        }

        Object.assign(existing, payload);
        await existing.save();

        res.json({
            success: true,
            message: 'Promotion updated successfully',
            data: existing
        });
    } catch (error) {
        next(error);
    }
};

const deletePromotion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const promotion = await Promotion.findById(id);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }

        await Promotion.deleteOne({ _id: id });
        res.json({
            success: true,
            message: 'Promotion deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivePromotions,
    getAdminPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion
};
