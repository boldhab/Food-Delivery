const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middleware/error.middleware');
const sanitizeRequest = require('./middleware/sanitize.middleware');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes'); // ADD THIS

const app = express();

// Security middleware
app.use(helmet());

// Body parser
app.use(cors());
app.use(express.json());

// Sanitize request
app.use(sanitizeRequest);

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many attempts, please try again later'
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server & MongoDB connected!' });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); // ADD THIS LINE

// Error handler
app.use(errorMiddleware);

module.exports = app;