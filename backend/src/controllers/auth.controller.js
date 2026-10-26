const authService = require('../services/auth.service');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body || {};
        const data = await authService.register({ name, email, password, phone, address });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const data = await authService.login({ email, password });

        res.json({
            success: true,
            message: 'Login successful',
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                isUnderReview: Boolean(error.isUnderReview),
                driverEmail: error.driverEmail,
                driverName: error.driverName
            });
        }
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const data = await authService.getProfile(req.user._id);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const data = await authService.updateProfile(req.user._id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        await authService.changePassword(req.user._id, { currentPassword, newPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body || {};
        const result = await authService.forgotPassword(email);

        res.json({
            success: true,
            message: result.message,
            resetToken: result.resetToken,
            resetUrl: result.resetUrl
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body || {};
        const result = await authService.resetPassword({ token, newPassword });

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
    try {
        const { credential, email, name, avatar, googleId } = req.body || {};
        const data = await authService.googleAuth({ credential, email, name, avatar, googleId });

        res.json({
            success: true,
            message: 'Google authentication successful',
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Apply / Register as Courier Driver
// @route   POST /api/auth/driver-apply
// @access  Public
const driverApply = async (req, res, next) => {
    try {
        const data = await authService.driverApply(req.body || {});

        res.status(201).json({
            success: true,
            message: 'Courier application received and currently under review',
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Get driver application status
// @route   GET/POST /api/auth/driver-status
// @access  Public
const getDriverStatus = async (req, res, next) => {
    try {
        const query = req.query.query || req.body.query || req.body.email || req.body.refId;
        const data = await authService.getDriverStatus(query);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
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
};
