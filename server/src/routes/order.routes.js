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
const validate = require('../middleware/validate.middleware');
const {
    placeOrderRules,
    orderIdParamRules,
    cancelOrderRules,
    updateStatusRules,
    listOrdersQueryRules
} = require('../validations/order.validation');

// All routes require authentication
router.use(protect);

// ==================== USER ROUTES ====================

router.post('/', placeOrderRules, validate, createOrder);
router.get('/my-orders', listOrdersQueryRules, validate, getMyOrders);
router.get('/:id', orderIdParamRules, validate, getOrderById);
router.put('/:id/cancel', cancelOrderRules, validate, cancelOrder);

// ==================== ADMIN ROUTES ====================
// Admin routes are protected by admin middleware

router.get('/admin/all', admin, listOrdersQueryRules, validate, getAllOrders);
router.put('/admin/:id/status', admin, updateStatusRules, validate, updateOrderStatus);

module.exports = router;
