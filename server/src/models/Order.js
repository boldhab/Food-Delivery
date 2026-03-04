const mongoose = require('mongoose');

const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

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
        unique: true,
        default: generateOrderNumber
    },
    
    // User Information
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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
    specialInstructions: String,

    // Driver Workflow
    driverWorkflow: {
        assignmentStatus: {
            type: String,
            enum: ['unassigned', 'accepted', 'declined'],
            default: 'unassigned'
        },
        assignmentNote: String,
        acceptedAt: Date,
        declinedAt: Date,
        checkedInAt: Date,
        pickupVerified: {
            items: { type: Boolean, default: false },
            packaging: { type: Boolean, default: false },
            tamperSeal: { type: Boolean, default: false }
        },
        pickedUpAt: Date,
        transitStartedAt: Date,
        deliveryInstructionsFollowed: { type: Boolean, default: false },
        codCollected: { type: Boolean, default: false },
        codAmount: { type: Number, default: 0, min: 0 },
        handoffType: {
            type: String,
            enum: ['in_person', 'contactless'],
            default: 'in_person'
        },
        issueReport: {
            type: {
                type: String,
                enum: ['missing_items', 'address_problem', 'delay', 'other']
            },
            description: String,
            reportedAt: Date
        },
        customerRating: { type: Number, min: 1, max: 5 },
        earnings: { type: Number, min: 0, default: 0 },
        compliance: {
            vehicleConditionOk: { type: Boolean, default: true },
            trafficLawsFollowed: { type: Boolean, default: true },
            hygieneStandardsMet: { type: Boolean, default: true },
            uniformWorn: { type: Boolean, default: true },
            checkedAt: Date
        }
    }
    
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function() {
    if (!this.orderNumber) {
        this.orderNumber = generateOrderNumber();
    }
});

// Indexes (KEEP)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ driver: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderStatus: 1, driver: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
