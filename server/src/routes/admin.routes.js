const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');

// Import controllers
const {
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getSalesReport
} = require('../controllers/order.controller');

const {
    getAllUsers,
    getUserDetails,
    updateUserStatus
} = require('../controllers/admin.controller');

const {
    getFoodsWithStats,
    getInventoryAlerts
} = require('../controllers/admin.food.controller');

// All admin routes require authentication and admin role
router.use(protect, admin);

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/sales-report', getSalesReport);

// ==================== ORDER MANAGEMENT ====================
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ==================== USER MANAGEMENT ====================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// ==================== FOOD MANAGEMENT ====================
router.get('/foods', getFoodsWithStats);
router.get('/foods/alerts', getInventoryAlerts);

module.exports = router;