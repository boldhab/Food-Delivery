const { body } = require('express-validator');

const foodCategories = [
    'Pizza', 'Burger', 'Sushi', 'Chinese', 'Indian',
    'Mexican', 'Italian', 'Thai', 'Desserts', 'Beverages',
    'Salads', 'Breakfast', 'Seafood', 'BBQ', 'Healthy',
    'Fast Food', 'Vegetarian', 'Vegan'
];

const addFoodRules = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('name must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('description must be between 3 and 500 characters'),
    body('price')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('price must be between 0 and 10000'),
    body('category')
        .isIn(foodCategories)
        .withMessage('category is invalid'),
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be boolean'),
    body('isVegetarian')
        .optional()
        .isBoolean()
        .withMessage('isVegetarian must be boolean'),
    body('isPopular')
        .optional()
        .isBoolean()
        .withMessage('isPopular must be boolean'),
    body('preparationTime')
        .optional()
        .isInt({ min: 5, max: 120 })
        .withMessage('preparationTime must be between 5 and 120')
];

const updateFoodRules = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('description must be between 3 and 500 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0, max: 10000 })
        .withMessage('price must be between 0 and 10000'),
    body('category')
        .optional()
        .isIn(foodCategories)
        .withMessage('category is invalid'),
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be boolean'),
    body('isVegetarian')
        .optional()
        .isBoolean()
        .withMessage('isVegetarian must be boolean'),
    body('isPopular')
        .optional()
        .isBoolean()
        .withMessage('isPopular must be boolean'),
    body('preparationTime')
        .optional()
        .isInt({ min: 5, max: 120 })
        .withMessage('preparationTime must be between 5 and 120')
];

module.exports = {
    addFoodRules,
    updateFoodRules,
    foodCategories
};
