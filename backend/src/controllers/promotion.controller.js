const prisma = require('../config/prisma');

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
    ctaLabel: String(payload.ctaLabel || 'Claim Offer').trim()
});

const normalizePromotion = (p) => {
    if (!p) return null;
    return {
        ...p,
        _id: p.id
    };
};

const getActivePromotions = async (req, res, next) => {
    try {
        const now = new Date();
        const promotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                AND: [
                    { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                    { OR: [{ endDate: null }, { endDate: { gte: now } }] }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                promotions: promotions.map(normalizePromotion)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAdminPromotions = async (req, res, next) => {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                promotions: promotions.map(normalizePromotion)
            }
        });
    } catch (error) {
        next(error);
    }
};

const createPromotion = async (req, res, next) => {
    try {
        const payload = normalizePromotionPayload(req.body);
        const promotion = await prisma.promotion.create({
            data: payload
        });

        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: {
                promotion: normalizePromotion(promotion)
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Promotion with this code already exists'
            });
        }
        next(error);
    }
};

const updatePromotion = async (req, res, next) => {
    try {
        const payload = normalizePromotionPayload(req.body);
        const promotion = await prisma.promotion.update({
            where: { id: req.params.id },
            data: payload
        });

        res.json({
            success: true,
            message: 'Promotion updated successfully',
            data: {
                promotion: normalizePromotion(promotion)
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Promotion with this code already exists'
            });
        }
        next(error);
    }
};

const deletePromotion = async (req, res, next) => {
    try {
        await prisma.promotion.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'Promotion deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const validatePromotion = async (req, res, next) => {
    try {
        const { code, orderAmount = 0 } = req.body || {};
        if (!code) {
            return res.status(400).json({ success: false, message: 'Promo code is required' });
        }
        const promoCode = String(code).trim().toUpperCase();
        const now = new Date();
        const promo = await prisma.promotion.findUnique({
            where: { code: promoCode }
        });

        if (!promo || !promo.isActive) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive promo code' });
        }
        if (promo.startDate && promo.startDate > now) {
            return res.status(400).json({ success: false, message: 'Promo code is not yet active' });
        }
        if (promo.endDate && promo.endDate < now) {
            return res.status(400).json({ success: false, message: 'Promo code has expired' });
        }
        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit has been reached' });
        }
        if (promo.minOrderAmount && Number(orderAmount) < promo.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of $${promo.minOrderAmount.toFixed(2)} required for this code`
            });
        }

        let discount = 0;
        if (promo.type === 'percent') {
            discount = (Number(orderAmount) * promo.value) / 100;
        } else {
            discount = Math.min(Number(orderAmount), promo.value);
        }

        return res.json({
            success: true,
            message: `Promo code ${promo.code} applied!`,
            data: {
                code: promo.code,
                title: promo.title,
                type: promo.type,
                value: promo.value,
                discount: parseFloat(discount.toFixed(2))
            }
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
    deletePromotion,
    validatePromotion
};
