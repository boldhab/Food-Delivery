const prisma = require('../config/prisma');

const recalculateCart = async (cartId) => {
    const items = await prisma.cartItem.findMany({
        where: { cartId },
        include: { food: true }
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cartId },
        data: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalItems
        },
        include: {
            items: {
                include: { food: true }
            }
        }
    });

    return formatCartResponse(updatedCart);
};

const formatCartResponse = (cart) => {
    if (!cart) return { items: [], subtotal: 0, totalItems: 0 };
    return {
        _id: cart.id,
        id: cart.id,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems,
        items: cart.items.map((item) => ({
            _id: item.id,
            id: item.id,
            foodId: item.food ? { ...item.food, _id: item.food.id } : item.foodId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            snapshot: item.snapshot
        }))
    };
};

const getCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { food: true }
            }
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                subtotal: 0,
                totalItems: 0
            },
            include: {
                items: {
                    include: { food: true }
                }
            }
        });
    }

    return formatCartResponse(cart);
};

const addToCart = async ({ userId, foodId, quantity = 1 }) => {
    if (quantity < 1 || quantity > 20) {
        const error = new Error('Quantity must be between 1 and 20');
        error.statusCode = 400;
        throw error;
    }

    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food || !food.isAvailable) {
        const error = new Error('Food item not found or unavailable');
        error.statusCode = 404;
        throw error;
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId, subtotal: 0, totalItems: 0 }
        });
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, foodId }
    });

    if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > 20) {
            const error = new Error('Cannot add more than 20 of this item');
            error.statusCode = 400;
            throw error;
        }

        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQty }
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                foodId,
                name: food.name,
                price: food.price,
                quantity,
                snapshot: {
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    isVegetarian: food.isVegetarian
                }
            }
        });
    }

    return recalculateCart(cart.id);
};

const updateCartItem = async ({ userId, itemId, foodId, quantity }) => {
    if (quantity < 1 || quantity > 20) {
        const error = new Error('Quantity must be between 1 and 20');
        error.statusCode = 400;
        throw error;
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        const error = new Error('Cart not found');
        error.statusCode = 404;
        throw error;
    }

    const itemIdentifier = itemId || foodId;
    if (!itemIdentifier) {
        const error = new Error('itemId or foodId is required');
        error.statusCode = 400;
        throw error;
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            OR: [
                { id: itemIdentifier },
                { foodId: itemIdentifier }
            ]
        }
    });

    if (!existingItem) {
        const error = new Error('Item not found in cart');
        error.statusCode = 404;
        throw error;
    }

    await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity }
    });

    return recalculateCart(cart.id);
};

const removeFromCart = async ({ userId, itemId, foodId }) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        const error = new Error('Cart not found');
        error.statusCode = 404;
        throw error;
    }

    const itemIdentifier = itemId || foodId;
    if (!itemIdentifier) {
        const error = new Error('itemId or foodId is required');
        error.statusCode = 400;
        throw error;
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            OR: [
                { id: itemIdentifier },
                { foodId: itemIdentifier }
            ]
        }
    });

    if (!existingItem) {
        const error = new Error('Item not found in cart');
        error.statusCode = 404;
        throw error;
    }

    await prisma.cartItem.delete({ where: { id: existingItem.id } });
    return recalculateCart(cart.id);
};

const clearCart = async (userId) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { items: [], subtotal: 0, totalItems: 0 };

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return recalculateCart(cart.id);
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
