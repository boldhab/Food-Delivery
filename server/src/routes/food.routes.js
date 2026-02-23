const express = require('express');
const router = express.Router();
const {
    // Admin
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability,
    
    // Public
    getAllFoods,
    getFoodById,
    getFoodsByCategory,
    searchFoods,
    getFeaturedFoods,
    getAllCategories
} = require('../controllers/food.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const {
    addFoodRules,
    updateFoodRules
} = require('../validations/food.validation');

// ==================== PUBLIC ROUTES ====================
router.get('/', getAllFoods);
router.get('/search', searchFoods);
router.get('/featured', getFeaturedFoods);
router.get('/categories/all', getAllCategories);
router.get('/category/:category', getFoodsByCategory);
router.get('/:id', getFoodById);

// ==================== ADMIN ROUTES ====================
router.post('/', protect, admin, upload.single('image'), addFoodRules, validate, createFood);
router.put('/:id', protect, admin, updateFoodRules, validate, updateFood);
router.delete('/:id', protect, admin, deleteFood);
router.patch('/:id/toggle-availability', protect, admin, toggleAvailability);

module.exports = router;
