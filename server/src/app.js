const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const orderRoutes = require('./routes/order.routes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server & MongoDB connected!' });
});

// Your actual routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);

// Error handler
app.use(errorMiddleware);

module.exports = app;
