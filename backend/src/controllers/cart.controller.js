const cartService = require('../services/cart.service');
const { calculateOrderTotals } = require('../utils/order.utils');

const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id || req.user._id);
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

const getCartSummary = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id || req.user._id);
        const { tax, deliveryFee, total } = calculateOrderTotals(cart.subtotal);

        res.json({
            success: true,
            data: {
                items: cart.items,
                subtotal: cart.subtotal,
                tax,
                deliveryFee,
                totalAmount: total,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCartCount = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id || req.user._id);
        res.json({
            success: true,
            count: cart.totalItems
        });
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { foodId, quantity = 1 } = req.body || {};
        const cart = await cartService.addToCart({
            userId: req.user.id || req.user._id,
            foodId,
            quantity: Number(quantity)
        });

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const itemId = req.params.itemId || req.body?.itemId;
        const foodId = req.body?.foodId;
        const { quantity } = req.body || {};
        const cart = await cartService.updateCartItem({
            userId: req.user.id || req.user._id,
            itemId,
            foodId,
            quantity: Number(quantity)
        });

        res.json({
            success: true,
            message: 'Cart updated successfully',
            data: cart
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const itemId = req.params.itemId || req.body?.itemId;
        const foodId = req.params.foodId || req.body?.foodId;
        const cart = await cartService.removeFromCart({
            userId: req.user.id || req.user._id,
            itemId,
            foodId
        });

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.user.id || req.user._id);
        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    getCartSummary,
    getCartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
