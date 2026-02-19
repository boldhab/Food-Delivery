const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },

    name: {
        type: String,
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

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [orderItemSchema],

    deliveryAddress: {
        addressLine1: { type: String, required: true },
        addressLine2: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true }
    },

    subtotal: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ['stripe', 'cash_on_delivery'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },

    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
        default: 'pending'
    },

    orderDate: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        const random = Math.floor(100000 + Math.random() * 900000);
        this.orderNumber = `ORD-${random}`;
    }
    next();
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
