const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/notification.controller');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);

module.exports = router;
