const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    registerRules,
    loginRules,
    updateProfileRules,
    changePasswordRules
} = require('../validations/auth.validation');

// Public routes
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileRules, validate, updateUserProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
