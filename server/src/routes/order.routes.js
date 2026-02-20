const express = require('express');
const router = express.Router();
const {
    // User
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    
    // Admin
    getAllOrders,
    updateOrderStatus
} = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// ==================== USER ROUTES ====================

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// ==================== ADMIN ROUTES ====================
// Admin routes are protected by admin middleware

router.get('/admin/all', admin, getAllOrders);
router.put('/admin/:id/status', admin, updateOrderStatus);

module.exports = router;