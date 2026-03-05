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
    assignDriverToOrder,
    sendOrderEmailNotification,
    sendOrderSMSNotification,
    sendOrderMessageNotification
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
const {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/notification.controller');

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
router.post('/orders/:id/notify/email', sendOrderEmailNotification);
router.post('/orders/:id/notify/sms', sendOrderSMSNotification);
router.post('/orders/:id/notify/message', sendOrderMessageNotification);
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

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
