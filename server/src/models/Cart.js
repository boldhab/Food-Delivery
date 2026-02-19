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
        min: 1
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    itemTotal: {
        type: Number,
        required: true,
        min: 0
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    items: [cartItemSchema],

    subtotal: {
        type: Number,
        default: 0
    },

    total: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

cartSchema.methods.calculateTotals = function () {
    this.subtotal = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
    this.total = this.subtotal;
};

module.exports = mongoose.model('Cart', cartSchema);
