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

const app = express();

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);

// Body parser
app.use(cors());
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

// Error handler
app.use(errorMiddleware);

module.exports = app;
