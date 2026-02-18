const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({ /* schema */ }, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
