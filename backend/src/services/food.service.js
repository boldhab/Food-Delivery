const prisma = require('../config/prisma');

const normalizeFood = (food) => {
    if (!food) return null;
    return {
        ...food,
        _id: food.id // backward-compatibility for frontends
    };
};

const createFood = async (foodData) => {
    const food = await prisma.food.create({
        data: {
            name: foodData.name,
            description: foodData.description,
            price: Number(foodData.price),
            category: foodData.category,
            image: foodData.image || '/assets/default-food.svg',
            imagePublicId: foodData.imagePublicId || null,
            isAvailable: foodData.isAvailable !== undefined ? Boolean(foodData.isAvailable) : true,
            isVegetarian: Boolean(foodData.isVegetarian),
            isPopular: Boolean(foodData.isPopular),
            isFeatured: Boolean(foodData.isFeatured),
            preparationTime: Number(foodData.preparationTime || 20),
            ingredients: Array.isArray(foodData.ingredients) ? foodData.ingredients : [],
            allergens: Array.isArray(foodData.allergens) ? foodData.allergens : [],
            calories: foodData.calories ? Number(foodData.calories) : null,
            createdById: foodData.createdBy || null
        }
    });
    return normalizeFood(food);
};

const updateFood = async (id, updateData) => {
    const dataToUpdate = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.price !== undefined) dataToUpdate.price = Number(updateData.price);
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
    if (updateData.image !== undefined) dataToUpdate.image = updateData.image;
    if (updateData.imagePublicId !== undefined) dataToUpdate.imagePublicId = updateData.imagePublicId;
    if (updateData.isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(updateData.isAvailable);
    if (updateData.isVegetarian !== undefined) dataToUpdate.isVegetarian = Boolean(updateData.isVegetarian);
    if (updateData.isPopular !== undefined) dataToUpdate.isPopular = Boolean(updateData.isPopular);
    if (updateData.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.preparationTime !== undefined) dataToUpdate.preparationTime = Number(updateData.preparationTime);
    if (updateData.ingredients !== undefined && Array.isArray(updateData.ingredients)) dataToUpdate.ingredients = updateData.ingredients;
    if (updateData.allergens !== undefined && Array.isArray(updateData.allergens)) dataToUpdate.allergens = updateData.allergens;
    if (updateData.calories !== undefined) dataToUpdate.calories = updateData.calories ? Number(updateData.calories) : null;

    const food = await prisma.food.update({
        where: { id },
        data: dataToUpdate
    });
    return normalizeFood(food);
};

const findFoodById = async (id) => {
    const food = await prisma.food.findUnique({
        where: { id },
        include: {
            reviews: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    return normalizeFood(food);
};

const deleteFood = async (id) => {
    const food = await prisma.food.findUnique({ where: { id } });
    if (!food) {
        const error = new Error('Food item not found');
        error.statusCode = 404;
        throw error;
    }
    await prisma.food.delete({ where: { id } });
    return normalizeFood(food);
};

const toggleAvailability = async (id) => {
    const food = await prisma.food.findUnique({ where: { id } });
    if (!food) {
        const error = new Error('Food item not found');
        error.statusCode = 404;
        throw error;
    }
    const updated = await prisma.food.update({
        where: { id },
        data: { isAvailable: !food.isAvailable }
    });
    return normalizeFood(updated);
};

const getAllFoods = async ({ category, isVegetarian, search, sort = 'createdAt', order = 'desc', page = 1, limit = 50 } = {}) => {
    const where = {};
    if (category && category !== 'All') {
        where.category = { equals: category, mode: 'insensitive' };
    }
    if (isVegetarian !== undefined) {
        where.isVegetarian = isVegetarian === 'true' || isVegetarian === true;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } }
        ];
    }

    const orderBy = {};
    if (sort === 'price') {
        orderBy.price = order === 'asc' ? 'asc' : 'desc';
    } else if (sort === 'rating') {
        orderBy.rating = 'desc';
    } else {
        orderBy.createdAt = 'desc';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [foods, total] = await Promise.all([
        prisma.food.findMany({
            where,
            orderBy,
            skip,
            take: Number(limit)
        }),
        prisma.food.count({ where })
    ]);

    return {
        foods: foods.map(normalizeFood),
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
    };
};

const getFoodsByCategory = async (category) => {
    const foods = await prisma.food.findMany({
        where: {
            category: { equals: category, mode: 'insensitive' },
            isAvailable: true
        },
        orderBy: { createdAt: 'desc' }
    });
    return foods.map(normalizeFood);
};

const searchFoods = async (term = '') => {
    const searchTerm = String(term || '').trim();
    const where = { isAvailable: true };
    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }
    const foods = await prisma.food.findMany({
        where,
        orderBy: { rating: 'desc' }
    });
    return foods.map(normalizeFood);
};

const getFeaturedFoods = async (limit = 8) => {
    const foods = await prisma.food.findMany({
        where: {
            isAvailable: true,
            OR: [
                { isFeatured: true },
                { rating: { gte: 4.5 } }
            ]
        },
        orderBy: [
            { isFeatured: 'desc' },
            { rating: 'desc' }
        ],
        take: Number(limit)
    });
    return foods.map(normalizeFood);
};

const getAllCategories = async () => {
    const foods = await prisma.food.findMany({
        where: { isAvailable: true },
        select: { category: true },
        distinct: ['category']
    });
    return foods.map((f) => f.category).sort();
};

module.exports = {
    createFood,
    updateFood,
    findFoodById,
    deleteFood,
    toggleAvailability,
    getAllFoods,
    getFoodsByCategory,
    searchFoods,
    getFeaturedFoods,
    getAllCategories
};
