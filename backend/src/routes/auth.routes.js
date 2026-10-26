const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    driverApply,
    getDriverStatus
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    registerRules,
    loginRules,
    updateProfileRules,
    changePasswordRules,
    forgotPasswordRules,
    resetPasswordRules,
    googleAuthRules,
    driverApplyRules
} = require('../validations/auth.validation');

const authAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 50 : 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again later'
    }
});

// Public routes
router.post('/register', authAttemptLimiter, registerRules, validate, registerUser);
router.post('/login', authAttemptLimiter, loginRules, validate, loginUser);
router.post('/forgot-password', authAttemptLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', authAttemptLimiter, resetPasswordRules, validate, resetPassword);
router.post('/google', authAttemptLimiter, googleAuthRules, validate, googleAuth);
router.post('/driver-apply', authAttemptLimiter, driverApplyRules, validate, driverApply);
router.get('/driver-status', getDriverStatus);
router.post('/driver-status', getDriverStatus);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileRules, validate, updateUserProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
