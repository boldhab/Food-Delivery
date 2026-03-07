const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const errorMiddleware = require('./middleware/error.middleware');
const sanitizeRequest = require('./middleware/sanitize.middleware');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const promotionRoutes = require('./routes/promotion.routes');

const app = express();

const parseAllowedOrigins = () => {
    const value = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '';
    const parsed = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.replace(/\/+$/, ''));

    if (parsed.length > 0) return parsed;

    if (process.env.NODE_ENV === 'production') {
        return [];
    }

    return [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5175'
    ];
};

const allowedOrigins = parseAllowedOrigins();

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error(
        'CORS is not configured for production. Set CORS_ORIGINS (comma-separated) with trusted domains.'
    );
}

const corsOptions = {
    origin: (origin, callback) => {
        // Allow server-to-server requests with no browser origin header.
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);

// Body parser
app.use(cors(corsOptions));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Sanitize request
app.use(sanitizeRequest);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server & MongoDB connected!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);

// Error handler
app.use(errorMiddleware);

module.exports = app;
