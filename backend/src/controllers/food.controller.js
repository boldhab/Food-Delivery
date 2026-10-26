const foodService = require('../services/food.service');
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

const createFood = async (req, res, next) => {
    try {
        normalizeImageFields(req.body);
        req.body.createdBy = req.user?.id || req.user?._id;

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

        const food = await foodService.createFood(req.body);

        res.status(201).json({
            success: true,
            message: 'Food item created successfully',
            data: food
        });
    } catch (error) {
        if (error.code === 'P2002' || error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Food item with this name already exists'
            });
        }
        next(error);
    }
};

const updateFood = async (req, res, next) => {
    try {
        normalizeImageFields(req.body);

        const existingFood = await foodService.findFoodById(req.params.id);
        if (!existingFood) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        if (req.file) {
            try {
                if (existingFood.imagePublicId) {
                    await destroyByPublicId(existingFood.imagePublicId);
                }
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

        const updated = await foodService.updateFood(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Food item updated successfully',
            data: updated
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Food item with this name already exists'
            });
        }
        next(error);
    }
};

const deleteFood = async (req, res, next) => {
    try {
        const food = await foodService.findFoodById(req.params.id);
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
                console.error(`Failed to cleanup Cloudinary asset: ${cleanupError.message}`);
            }
        }

        await foodService.deleteFood(req.params.id);

        res.json({
            success: true,
            message: 'Food item deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const toggleAvailability = async (req, res, next) => {
    try {
        const updated = await foodService.toggleAvailability(req.params.id);
        res.json({
            success: true,
            message: `Food item is now ${updated.isAvailable ? 'available' : 'unavailable'}`,
            data: { isAvailable: updated.isAvailable }
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// ==================== PUBLIC CONTROLLERS ====================

const getAllFoods = async (req, res, next) => {
    try {
        const result = await foodService.getAllFoods(req.query);
        res.json({
            success: true,
            count: result.foods.length,
            pagination: {
                page: result.page,
                limit: Number(req.query.limit || 50),
                total: result.total,
                totalPages: result.totalPages
            },
            data: result.foods
        });
    } catch (error) {
        next(error);
    }
};

const getFoodById = async (req, res, next) => {
    try {
        const food = await foodService.findFoodById(req.params.id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
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

const getFoodsByCategory = async (req, res, next) => {
    try {
        const foods = await foodService.getFoodsByCategory(req.params.category);
        res.json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

const searchFoods = async (req, res, next) => {
    try {
        const term = req.query.keyword || req.query.q || req.query.query || req.params.query || '';
        const foods = await foodService.searchFoods(term);
        res.json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

const getFeaturedFoods = async (req, res, next) => {
    try {
        const foods = await foodService.getFeaturedFoods();
        res.json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await foodService.getAllCategories();
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability,
    getAllFoods,
    getFoodById,
    getFoodsByCategory,
    searchFoods,
    getFeaturedFoods,
    getAllCategories
};
