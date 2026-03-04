const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');

// Import controllers
const {
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getSalesReport,
    getAvailableDrivers,
    assignDriverToOrder
} = require('../controllers/order.controller');
const { deleteFood } = require('../controllers/food.controller');

const {
    createUser,
    getAllUsers,
    getUserDetails,
    updateUserStatus
} = require('../controllers/admin.controller');

const {
    getFoodByIdAdmin,
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
router.get('/drivers/available', getAvailableDrivers);
router.put('/orders/:id/assign-driver', assignDriverToOrder);

// ==================== USER MANAGEMENT ====================
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// ==================== FOOD MANAGEMENT ====================
router.get('/foods', getFoodsWithStats);
router.get('/foods/alerts', getInventoryAlerts);
router.get('/foods/:id', getFoodByIdAdmin);
router.delete('/foods/:id', deleteFood);

module.exports = router;
