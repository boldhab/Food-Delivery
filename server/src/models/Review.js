const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({ /* schema */ }, { timestamps: true });
module.exports = mongoose.model('Review', reviewSchema);
