const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({ /* schema */ }, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
