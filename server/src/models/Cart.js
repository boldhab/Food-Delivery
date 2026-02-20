const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1'],
        max: [20, 'Maximum quantity per item is 20']
    },
    
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    
    name: {
        type: String,
        required: true
    },
    
    // Snapshot of food details at time of adding
    snapshot: {
        name: String,
        price: Number,
        image: String,
        isVegetarian: Boolean
    }
}, {
    _id: true
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    items: [cartItemSchema],
    
    // Calculated fields
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    
    totalItems: {
        type: Number,
        default: 0,
        min: 0
    }
    
}, {
    timestamps: true
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    this.totalItems = this.items.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);
};

// Method to find item index by foodId
cartSchema.methods.findItemIndex = function(foodId) {
    return this.items.findIndex(
        item => item.foodId.toString() === foodId.toString()
    );
};

module.exports = mongoose.model('Cart', cartSchema);