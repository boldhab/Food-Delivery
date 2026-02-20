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
    
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Snapshot of food at time of order
    snapshot: {
        name: String,
        price: Number,
        image: String,
        isVegetarian: Boolean
    }
});

const orderSchema = new mongoose.Schema({
    // Order Identification
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    // User Information
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    userDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    
    // Order Items
    items: [orderItemSchema],
    
    // Delivery Address
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        instructions: String
    },
    
    // Financial Details
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    // Payment Information
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'card', 'online'],
        required: true
    },
    
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    
    paymentId: String,
    
    // Order Status
    orderStatus: {
        type: String,
        enum: [
            'pending',      // Order placed
            'confirmed',    // Restaurant accepted
            'preparing',    // Being prepared
            'out_for_delivery', // On the way
            'delivered',    // Completed
            'cancelled',    // Cancelled by user
            'rejected'      // Rejected by restaurant
        ],
        default: 'pending'
    },
    
    statusHistory: [
        {
            status: {
                type: String,
                enum: [
                    'pending', 'confirmed', 'preparing', 
                    'out_for_delivery', 'delivered', 'cancelled', 'rejected'
                ]
            },
            timestamp: { type: Date, default: Date.now },
            note: String,
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    
    // Timestamps
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    
    // Cancellation Details
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Additional Info
    specialInstructions: String
    
}, {
    timestamps: true
});

// Generate order number before saving (KEEP - only here)
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
    next();
});

// Indexes (KEEP)
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);