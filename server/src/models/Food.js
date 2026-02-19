const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
        unique: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000, 'Price cannot exceed 10000']
    },
    
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Pizza', 'Burger', 'Sushi', 'Chinese', 'Indian',
            'Mexican', 'Italian', 'Thai', 'Desserts', 'Beverages',
            'Salads', 'Breakfast', 'Seafood', 'BBQ', 'Healthy',
            'Fast Food', 'Vegetarian', 'Vegan'
        ]
    },
    
    image: {
        type: String,
        default: 'default-food.jpg'
    },
    
    isAvailable: {
        type: Boolean,
        default: true
    },
    
    isVegetarian: {
        type: Boolean,
        default: false
    },
    
    isPopular: {
        type: Boolean,
        default: false
    },
    
    preparationTime: {
        type: Number, // in minutes
        default: 15,
        min: 5,
        max: 120
    },
    
    // Track who created/updated this food item
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    
}, {
    timestamps: true
});

// Indexes for better query performance
foodSchema.index({ name: 'text', description: 'text' }); // For search
foodSchema.index({ category: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ isAvailable: 1, isPopular: -1 });
foodSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Food', foodSchema);