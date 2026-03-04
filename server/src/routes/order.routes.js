const express = require('express');
const router = express.Router();
const {
    // User
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    // Driver
    getAvailableDriverOrders,
    getDriverOrders,
    acceptDeliveryRequest,
    declineDeliveryRequest,
    checkInAtRestaurant,
    markOrderPickedUp,
    startDeliveryTransit,
    completeDelivery,
    submitPostDeliveryReport,
    submitDriverCompliance,
    
    // Admin
    getAllOrders,
    updateOrderStatus
} = require('../controllers/order.controller');
const { protect, admin, driver } = require('../middleware/auth.middleware');
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

// ==================== DRIVER ROUTES ====================
router.get('/driver/available', driver, getAvailableDriverOrders);
router.get('/driver/my-deliveries', driver, getDriverOrders);
router.put('/driver/:id/accept', driver, acceptDeliveryRequest);
router.put('/driver/:id/decline', driver, declineDeliveryRequest);
router.put('/driver/:id/check-in', driver, checkInAtRestaurant);
router.put('/driver/:id/pickup', driver, markOrderPickedUp);
router.put('/driver/:id/transit', driver, startDeliveryTransit);
router.put('/driver/:id/delivered', driver, completeDelivery);
router.put('/driver/:id/post-delivery', driver, submitPostDeliveryReport);
router.put('/driver/:id/compliance', driver, submitDriverCompliance);

router.get('/:id', orderIdParamRules, validate, getOrderById);
router.put('/:id/cancel', cancelOrderRules, validate, cancelOrder);

// ==================== ADMIN ROUTES ====================
// Admin routes are protected by admin middleware

router.get('/admin/all', admin, listOrdersQueryRules, validate, getAllOrders);
router.put('/admin/:id/status', admin, updateStatusRules, validate, updateOrderStatus);

module.exports = router;
