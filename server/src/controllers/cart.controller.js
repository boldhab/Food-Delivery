const Cart = require('../models/cart.model');
const Food = require('../models/food.model');

// ==================== HELPER FUNCTIONS ====================

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
        cart = await Cart.create({ 
            user: userId,
            items: [],
            subtotal: 0,
            totalItems: 0
        });
    }
    
    return cart;
};

const validateFood = async (foodId) => {
    return await Food.findOne({ 
        _id: foodId, 
        isAvailable: true 
    });
};

// ==================== CART OPERATIONS ====================

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = async (req, res, next) => {
    try {
        const { foodId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: 'Food ID is required'
            });
        }

        if (quantity < 1 || quantity > 20) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be between 1 and 20'
            });
        }

        // Check if food exists and is available
        const food = await validateFood(foodId);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found or unavailable'
            });
        }

        // Get or create user's cart
        const cart = await getOrCreateCart(userId);

        // Check if item already exists in cart
        const itemIndex = cart.findItemIndex(foodId);

        if (itemIndex > -1) {
            // Item exists - update quantity
            const newQuantity = cart.items[itemIndex].quantity + quantity;
            
            if (newQuantity > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more than 20 of this item'
                });
            }

            cart.items[itemIndex].quantity = newQuantity;
        } else {
            // Item doesn't exist - add new item
            cart.items.push({
                foodId: food._id,
                quantity,
                price: food.price,
                name: food.name,
                snapshot: {
                    name: food.name,
                    price: food.price,
                    image: food.image,
                    isVegetarian: food.isVegetarian
                }
            });
        }

        // Recalculate totals
        cart.calculateTotals();
        await cart.save();

        // Populate food details for response
        await cart.populate('items.foodId', 'name price image category isVegetarian');

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.totalItems
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId })
            .populate('items.foodId', 'name price image category isVegetarian isAvailable');

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    items: [],
                    subtotal: 0,
                    totalItems: 0
                }
            });
        }

        // Check for unavailable items and update prices
        let itemsUpdated = false;
        
        for (let i = 0; i < cart.items.length; i++) {
            const item = cart.items[i];
            
            if (!item.foodId || !item.foodId.isAvailable) {
                cart.items.splice(i, 1);
                i--;
                itemsUpdated = true;
                continue;
            }
            
            if (item.foodId.price !== item.price) {
                item.price = item.foodId.price;
                itemsUpdated = true;
            }
        }

        if (itemsUpdated) {
            cart.calculateTotals();
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.totalItems
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/item/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: 'Quantity is required'
            });
        }

        if (quantity < 1 || quantity > 20) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be between 1 and 20'
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check if food is still available
        const food = await Food.findOne({ 
            _id: item.foodId, 
            isAvailable: true 
        });

        if (!food) {
            item.deleteOne();
            cart.calculateTotals();
            await cart.save();
            
            return res.status(400).json({
                success: false,
                message: 'Item is no longer available and has been removed from cart'
            });
        }

        item.quantity = quantity;
        cart.calculateTotals();
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.totalItems
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/item/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        item.deleteOne();
        cart.calculateTotals();
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.totalItems
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.subtotal = 0;
        cart.totalItems = 0;
        
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                items: [],
                subtotal: 0,
                totalItems: 0
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get cart summary for checkout
 * @route   GET /api/cart/summary
 * @access  Private
 */
const getCartSummary = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId })
            .populate('items.foodId', 'name price image category');

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        const TAX_RATE = 0.08;
        const DELIVERY_FEE = 5;
        const FREE_DELIVERY_THRESHOLD = 50;

        const estimatedTax = parseFloat((cart.subtotal * TAX_RATE).toFixed(2));
        const deliveryFee = cart.subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
        const grandTotal = parseFloat((cart.subtotal + estimatedTax + deliveryFee).toFixed(2));

        const items = cart.items.map(item => ({
            itemId: item._id,
            foodId: item.foodId._id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            image: item.snapshot?.image || item.foodId?.image
        }));

        const summary = {
            items,
            subtotal: cart.subtotal,
            totalItems: cart.totalItems,
            tax: {
                rate: TAX_RATE * 100 + '%',
                amount: estimatedTax
            },
            delivery: {
                fee: deliveryFee,
                isFree: deliveryFee === 0,
                freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD
            },
            grandTotal
        };

        res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get cart item count (for badge)
 * @route   GET /api/cart/count
 * @access  Private
 */
const getCartCount = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { count: 0 }
            });
        }

        res.status(200).json({
            success: true,
            data: { count: cart.totalItems }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    getCartCount
};