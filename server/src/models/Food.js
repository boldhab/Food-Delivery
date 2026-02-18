const mongoose = require('mongoose');
const foodSchema = new mongoose.Schema({ /* schema */ }, { timestamps: true });
module.exports = mongoose.model('Food', foodSchema);
