const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');

const DEFAULT_ADMIN = {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@foodiehub.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    phone: process.env.ADMIN_PHONE || '0000000000'
};

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MongoDB URI is missing. Set MONGODB_URI in server/.env');
    }
    await mongoose.connect(mongoUri);
};

const closeDB = async () => {
    await mongoose.connection.close();
};

const upsertAdmin = async ({ name, email, password, phone }) => {
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
        user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'admin',
            isActive: true
        });

        return { action: 'created', user };
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.role = 'admin';
    user.isActive = true;
    user.password = password;
    await user.save();

    return { action: 'updated', user };
};

const run = async () => {
    try {
        await connectDB();
        const result = await upsertAdmin(DEFAULT_ADMIN);
        console.log(
            `[create-admin] ${result.action.toUpperCase()}: ${result.user.email} (role=${result.user.role})`
        );
        console.log('[create-admin] Password has been set from ADMIN_PASSWORD or default value.');
    } catch (error) {
        console.error('[create-admin] Failed:', error.message);
        process.exitCode = 1;
    } finally {
        await closeDB();
    }
};

run();
