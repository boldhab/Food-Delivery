const crypto = require('crypto');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// In-memory security fallback stores for multi-tenant and unmigrated environments
const lockoutStore = new Map(); // email -> { failedAttempts, lockUntil }
const resetTokenStore = new Map(); // tokenHash -> { userId, email, expiresAt }

const register = async ({ name, email, password, phone, address = {} }) => {
    if (!name || !email || !password || !phone) {
        const error = new Error('name, email, password and phone are required');
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
        const error = new Error('User already exists with this email');
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone.trim(),
            street: address?.street || '',
            city: address?.city || '',
            state: address?.state || '',
            zipCode: address?.zipCode || '',
            role: 'user',
            isActive: true,
            cart: {
                create: {
                    subtotal: 0,
                    totalItems: 0
                }
            }
        }
    });

    const token = generateToken(user.id, user.role);

    return {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: {
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
        },
        token
    };
};

const login = async ({ email, password }) => {
    if (!email || !password) {
        const error = new Error('email and password are required');
        error.statusCode = 400;
        throw error;
    }

    const normEmail = email.toLowerCase().trim();
    const now = new Date();

    // Check if account is temporarily locked
    const lockout = lockoutStore.get(normEmail);
    if (lockout && lockout.lockUntil && lockout.lockUntil > now) {
        const remainingMinutes = Math.ceil((lockout.lockUntil.getTime() - now.getTime()) / 60000);
        const error = new Error(`Account temporarily locked due to consecutive failed attempts. Please retry in ${remainingMinutes} minute(s) or reset your password.`);
        error.statusCode = 429;
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { email: normEmail },
        include: { driverProfile: true }
    });

    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
        const failedCount = (lockout?.failedAttempts || 0) + 1;
        if (failedCount >= 5) {
            const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
            lockoutStore.set(normEmail, { failedAttempts: failedCount, lockUntil });
            const error = new Error('Too many failed login attempts. Your account has been temporarily locked for 15 minutes for your protection.');
            error.statusCode = 429;
            throw error;
        } else {
            lockoutStore.set(normEmail, { failedAttempts: failedCount, lockUntil: null });
            const remaining = 5 - failedCount;
            const error = new Error(`Invalid email or password. (${remaining} attempt(s) remaining before security lockout)`);
            error.statusCode = 401;
            throw error;
        }
    }

    // Reset lockout counters upon successful login
    lockoutStore.delete(normEmail);

    if (!user.isActive) {
        if (user.role === 'driver') {
            const error = new Error('Your courier application is currently under review by our onboarding team.');
            error.statusCode = 403;
            error.isUnderReview = true;
            error.driverEmail = user.email;
            error.driverName = user.name;
            throw error;
        }
        const error = new Error('Your account has been deactivated');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user.id, user.role);

    return {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: {
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
        },
        driverProfile: user.driverProfile,
        token
    };
};

const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: true }
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: {
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
        },
        driverProfile: user.driverProfile,
        createdAt: user.createdAt
    };
};

const updateProfile = async (userId, updates = {}) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const dataToUpdate = {};
    if (updates.name) dataToUpdate.name = updates.name;
    if (updates.phone) dataToUpdate.phone = updates.phone;

    if (updates.address) {
        if (updates.address.street !== undefined) dataToUpdate.street = updates.address.street;
        if (updates.address.city !== undefined) dataToUpdate.city = updates.address.city;
        if (updates.address.state !== undefined) dataToUpdate.state = updates.address.state;
        if (updates.address.zipCode !== undefined) dataToUpdate.zipCode = updates.address.zipCode;
    }

    if (updates.email && updates.email.toLowerCase().trim() !== user.email) {
        const emailExists = await prisma.user.findUnique({
            where: { email: updates.email.toLowerCase().trim() }
        });
        if (emailExists) {
            const error = new Error('Email already in use');
            error.statusCode = 400;
            throw error;
        }
        dataToUpdate.email = updates.email.toLowerCase().trim();
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate
    });

    return {
        _id: updatedUser.id,
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: {
            street: updatedUser.street,
            city: updatedUser.city,
            state: updatedUser.state,
            zipCode: updatedUser.zipCode
        }
    };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        const error = new Error('currentPassword and newPassword are required');
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return true;
};

const forgotPassword = async (email) => {
    if (!email) {
        const error = new Error('Email is required');
        error.statusCode = 400;
        throw error;
    }

    const normEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
        where: { email: normEmail }
    });

    if (!user) {
        // Obfuscate whether user exists for user enumeration security
        return {
            success: true,
            message: 'If an account exists with that email address, a password reset link has been dispatched.'
        };
    }

    // Generate secure 32-byte hex token and store SHA-256 hash
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30-minute validity

    resetTokenStore.set(tokenHash, {
        userId: user.id,
        email: user.email,
        expiresAt
    });

    return {
        success: true,
        message: 'Password reset link generated successfully.',
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}`
    };
};

const resetPassword = async ({ token, newPassword }) => {
    if (!token || !newPassword) {
        const error = new Error('Reset token and new password are required');
        error.statusCode = 400;
        throw error;
    }

    if (newPassword.length < 6) {
        const error = new Error('Password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    const record = resetTokenStore.get(tokenHash);
    if (!record || record.expiresAt < now) {
        const error = new Error('Invalid or expired password reset token. Please request a new link.');
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword }
    });

    // Invalidate reset token and unlock account if locked
    resetTokenStore.delete(tokenHash);
    lockoutStore.delete(updatedUser.email.toLowerCase().trim());

    return {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.'
    };
};

const googleAuth = async ({ credential, email, name, avatar, googleId }) => {
    let userEmail = email;
    let userName = name;

    // Decode Google JWT if provided
    if (credential) {
        try {
            const decoded = require('jsonwebtoken').decode(credential);
            if (decoded?.email) {
                userEmail = decoded.email;
                userName = userName || decoded.name;
            }
        } catch {
            // Fallback to direct parameters
        }
    }

    if (!userEmail) {
        const error = new Error('Google authentication requires an email address');
        error.statusCode = 400;
        throw error;
    }

    const normEmail = userEmail.toLowerCase().trim();
    let user = await prisma.user.findUnique({
        where: { email: normEmail },
        include: { driverProfile: true }
    });

    if (user) {
        if (!user.isActive) {
            const error = new Error('Your account has been deactivated');
            error.statusCode = 401;
            throw error;
        }
        lockoutStore.delete(normEmail);
    } else {
        // Auto-provision customer account with randomized secure password
        const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
        user = await prisma.user.create({
            data: {
                name: (userName || normEmail.split('@')[0]).trim(),
                email: normEmail,
                password: randomPassword,
                phone: '',
                role: 'user',
                isActive: true,
                cart: {
                    create: {
                        subtotal: 0,
                        totalItems: 0
                    }
                }
            },
            include: { driverProfile: true }
        });
    }

    const token = generateToken(user.id, user.role);

    return {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        driverProfile: user.driverProfile,
        token
    };
};

const driverApply = async ({
    name,
    email,
    password,
    phone,
    vehicleType,
    plateNumber,
    licenseNumber,
    street,
    city,
    state,
    zipCode
}) => {
    if (!name || !email || !password || !phone || !vehicleType || !licenseNumber) {
        const error = new Error('Name, email, password, phone, vehicle type, and driver license number are required');
        error.statusCode = 400;
        throw error;
    }

    const normEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
        where: { email: normEmail }
    });

    if (existing) {
        const error = new Error('An account already exists with this email address');
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normEmail,
            password: hashedPassword,
            phone: phone.trim(),
            role: 'driver',
            isActive: false, // Initial state is Under Review until background screening / admin activation
            street: street?.trim() || '',
            city: city?.trim() || '',
            state: state?.trim() || '',
            zipCode: zipCode?.trim() || '',
            driverProfile: {
                create: {
                    vehicleType: vehicleType.trim(),
                    plateNumber: plateNumber?.trim() || '',
                    licenseNumber: licenseNumber.trim(),
                    isAvailable: false
                }
            }
        },
        include: {
            driverProfile: true
        }
    });

    const token = generateToken(user.id, 'driver');

    return {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        status: 'In Review',
        isUnderReview: true,
        address: {
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
        },
        driverProfile: user.driverProfile,
        token
    };
};

const getDriverStatus = async (query) => {
    if (!query) {
        const error = new Error('Email or application ID is required');
        error.statusCode = 400;
        throw error;
    }
    const norm = query.toLowerCase().trim();
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: norm },
                { id: query.trim() }
            ],
            role: 'driver'
        },
        include: { driverProfile: true }
    });

    if (!user) {
        const error = new Error('No courier application found');
        error.statusCode = 404;
        throw error;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        status: user.isActive ? 'Approved & Active' : 'In Review',
        vehicleType: user.driverProfile?.vehicleType,
        city: user.city,
        submittedAt: user.createdAt
    };
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    driverApply,
    getDriverStatus
};
