const { body } = require('express-validator');

const registerRules = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('email must be valid'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('phone is required'),
    body('address')
        .optional({ values: 'falsy' })
        .isObject()
        .withMessage('address must be an object'),
    body('address.street')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('address.street must be between 1 and 200 characters'),
    body('address.city')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('address.city must be between 1 and 100 characters'),
    body('address.state')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('address.state must be between 1 and 100 characters'),
    body('address.zipCode')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('address.zipCode must be between 3 and 20 characters')
];

const loginRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('email must be valid'),
    body('password')
        .notEmpty()
        .withMessage('password is required')
];

const updateProfileRules = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('name must be between 2 and 100 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('email must be valid'),
    body('phone')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('phone cannot be empty'),
    body('address')
        .optional({ values: 'falsy' })
        .isObject()
        .withMessage('address must be an object'),
    body('address.street')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('address.street must be between 1 and 200 characters'),
    body('address.city')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('address.city must be between 1 and 100 characters'),
    body('address.state')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('address.state must be between 1 and 100 characters'),
    body('address.zipCode')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('address.zipCode must be between 3 and 20 characters')
];

const changePasswordRules = [
    body('currentPassword')
        .notEmpty()
        .withMessage('currentPassword is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('newPassword must be at least 6 characters')
];

const forgotPasswordRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required')
];

const resetPasswordRules = [
    body('token')
        .trim()
        .notEmpty()
        .withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
];

const googleAuthRules = [
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('A valid email address is required if provided')
];

const driverApplyRules = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required for dispatch calls'),
    body('vehicleType')
        .trim()
        .notEmpty()
        .withMessage('Vehicle type is required'),
    body('licenseNumber')
        .trim()
        .notEmpty()
        .withMessage('Driver license number is required')
];

module.exports = {
    registerRules,
    loginRules,
    updateProfileRules,
    changePasswordRules,
    forgotPasswordRules,
    resetPasswordRules,
    googleAuthRules,
    driverApplyRules
};
