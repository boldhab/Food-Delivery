const express = require('express');
const router = express.Router();
const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    getCartCount
} = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(protect);

// ==================== CART ROUTES ====================

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   GET /api/cart/summary
 * @desc    Get cart summary for checkout
 * @access  Private
 */
router.get('/summary', getCartSummary);

/**
 * @route   GET /api/cart/count
 * @desc    Get total items count in cart
 * @access  Private
 */
router.get('/count', getCartCount);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', addToCart);

/**
 * @route   PUT /api/cart/item/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/item/:itemId', updateCartItem);

/**
 * @route   DELETE /api/cart/item/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/item/:itemId', removeFromCart);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/clear', clearCart);

module.exports = router;