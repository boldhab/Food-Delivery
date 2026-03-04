const Food = require('../models/Food');
const APIFeatures = require('../utils/apiResponse');
const { uploadBuffer, destroyByPublicId } = require('../services/cloudinary.service');

const normalizeImageFields = (body) => {
    if (!body || typeof body !== 'object') return;

    if (body.image !== undefined && typeof body.image !== 'string') {
        delete body.image;
    }

    if (body.imagePublicId !== undefined && typeof body.imagePublicId !== 'string') {
        delete body.imagePublicId;
    }
};

// ==================== ADMIN CONTROLLERS ====================

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
    try {
        normalizeImageFields(req.body);

        // Add the admin who created this
        req.body.createdBy = req.user._id;

        if (req.file) {
            try {
                const uploaded = await uploadBuffer(req.file, { folder: 'foods' });
                req.body.image = uploaded.secure_url;
                req.body.imagePublicId = uploaded.public_id;
            } catch (uploadError) {
                return res.status(502).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message || 'Cloudinary upload error'}`
                });
            }
        }

        const food = await Food.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Food item created successfully',
            data: food
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Food item with this name already exists'
            });
        }
        next(error);
    }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res, next) => {
    try {
        normalizeImageFields(req.body);

        let food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        if (req.file) {
            try {
                const uploaded = await uploadBuffer(req.file, { folder: 'foods' });
                req.body.image = uploaded.secure_url;
                req.body.imagePublicId = uploaded.public_id;

                if (food.imagePublicId) {
                    await destroyByPublicId(food.imagePublicId);
                }
            } catch (uploadError) {
                return res.status(502).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message || 'Cloudinary upload error'}`
                });
            }
        }

        food = await Food.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        res.json({
            success: true,
            message: 'Food item updated successfully',
            data: food
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Food item with this name already exists'
            });
        }
        next(error);
    }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        if (food.imagePublicId) {
            try {
                await destroyByPublicId(food.imagePublicId);
            } catch (cleanupError) {
                // Do not block DB deletion if media cleanup fails
                console.warn('Cloudinary cleanup failed for food:', food._id, cleanupError.message);
            }
        }

        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (!deletedFood) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.json({
            success: true,
            message: 'Food item deleted successfully',
            data: { id: deletedFood._id }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle food availability
// @route   PATCH /api/foods/:id/toggle-availability
// @access  Private/Admin
const toggleAvailability = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        food.isAvailable = !food.isAvailable;
        await food.save();

        res.json({
            success: true,
            message: `Food item is now ${food.isAvailable ? 'available' : 'unavailable'}`,
            data: { isAvailable: food.isAvailable }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== PUBLIC CONTROLLERS ====================

// @desc    Get all food items (with filtering, sorting, pagination)
// @route   GET /api/foods
// @access  Public
const getAllFoods = async (req, res, next) => {
    try {
        // Only show available items to public
        const baseQuery = Food.find({ isAvailable: true });

        // Build query using APIFeatures
        const features = new APIFeatures(baseQuery, req.query)
            .filter()
            .search()
            .sort()
            .limitFields()
            .paginate();

        // Execute query
        const foods = await features.query;
        
        // Get total count for pagination
        const totalCount = await Food.countDocuments({ isAvailable: true });

        // Get pagination metadata
        const pagination = features.getPaginationInfo(totalCount);

        res.json({
            success: true,
            count: foods.length,
            pagination,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        // Check if food is available
        if (!food.isAvailable) {
            return res.status(404).json({
                success: false,
                message: 'This item is currently unavailable'
            });
        }

        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get foods by category
// @route   GET /api/foods/category/:category
// @access  Public
const getFoodsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        
        // Build query for specific category
        const baseQuery = Food.find({ 
            category, 
            isAvailable: true 
        });

        const features = new APIFeatures(baseQuery, req.query)
            .sort()
            .limitFields()
            .paginate();

        const foods = await features.query;
        const totalCount = await Food.countDocuments({ 
            category, 
            isAvailable: true 
        });

        const pagination = features.getPaginationInfo(totalCount);

        res.json({
            success: true,
            count: foods.length,
            pagination,
            category,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search foods
// @route   GET /api/foods/search
// @access  Public
const searchFoods = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Search keyword is required'
            });
        }

        const foods = await Food.find({
            $and: [
                { isAvailable: true },
                {
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { description: { $regex: keyword, $options: 'i' } },
                        { category: { $regex: keyword, $options: 'i' } }
                    ]
                }
            ]
        }).limit(20); // Limit search results

        res.json({
            success: true,
            count: foods.length,
            keyword,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured/popular foods
// @route   GET /api/foods/featured
// @access  Public
const getFeaturedFoods = async (req, res, next) => {
    try {
        const foods = await Food.find({ 
            isAvailable: true,
            isPopular: true 
        }).limit(8); // Show top 8 popular items

        res.json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all categories (for filter dropdown)
// @route   GET /api/foods/categories/all
// @access  Public
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Food.distinct('category', { isAvailable: true });

        res.json({
            success: true,
            count: categories.length,
            data: categories.sort() // Sort alphabetically
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
