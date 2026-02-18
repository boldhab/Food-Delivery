const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({ /* schema */ }, { timestamps: true });
module.exports = mongoose.model('Cart', cartSchema);
