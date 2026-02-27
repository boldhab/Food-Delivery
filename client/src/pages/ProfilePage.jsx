import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiHome,
    FiGlobe,
    FiLock,
    FiBell,
    FiCreditCard,
    FiClock,
    FiPackage,
    FiHeart,
    FiLogOut,
    FiEdit2,
    FiCheck,
    FiX,
    FiCamera,
    FiEye,
    FiEyeOff,
    FiShield,
    FiSmartphone
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/auth.service';
import orderService from '../services/order.service';

const ProfilePage = () => {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    
    // State for different sections
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false });
    const [orderStats, setOrderStats] = useState({ total: 0, delivered: 0, cancelled: 0 });
    
    // Profile form state
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            zipCode: user?.address?.zipCode || '',
            country: user?.address?.country || 'USA',
        },
        preferences: {
            emailNotifications: user?.preferences?.emailNotifications ?? true,
            pushNotifications: user?.preferences?.pushNotifications ?? true,
            smsNotifications: user?.preferences?.smsNotifications ?? false,
            darkMode: user?.preferences?.darkMode ?? false,
            language: user?.preferences?.language || 'en',
        }
    });

    // Password form state
    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Load order stats
    useEffect(() => {
        const loadOrderStats = async () => {
            try {
                const response = await orderService.getOrderStats();
                setOrderStats(response?.data || response || { total: 0, delivered: 0, cancelled: 0 });
            } catch (error) {
                console.error('Failed to load order stats:', error);
            }
        };
        loadOrderStats();
    }, []);

    // Validate profile form
    const validateProfile = () => {
        const newErrors = {};

        if (!profile.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!profile.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!profile.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(profile.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate password form
    const validatePassword = () => {
        const newErrors = {};

        if (!password.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!password.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (password.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.newPassword)) {
            newErrors.newPassword = 'Password must contain uppercase, lowercase and number';
        }

        if (password.newPassword !== password.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateProfile()) return;

        setLoading(true);
        try {
            await authService.updateProfile(profile);
            await refreshUser();
            setIsEditing(false);
            toast.success('Profile updated successfully!', {
                icon: '✅',
                duration: 3000
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update profile', {
                icon: '❌',
                duration: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (!validatePassword()) return;

        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: password.currentPassword,
                newPassword: password.newPassword
            });
            setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully!', {
                icon: '🔒',
                duration: 3000
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to change password', {
                icon: '❌',
                duration: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        const confirm = window.confirm('Are you sure you want to logout?');
        if (confirm) {
            await logout();
            navigate('/login');
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Handle image upload logic
            toast.success('Profile picture updated!');
        }
    };

    // Tabs configuration
    const tabs = [
        { id: 'profile', label: 'Profile', icon: FiUser },
        { id: 'security', label: 'Security', icon: FiLock },
        { id: 'preferences', label: 'Preferences', icon: FiBell },
        { id: 'orders', label: 'Order History', icon: FiPackage },
        { id: 'payment', label: 'Payment Methods', icon: FiCreditCard },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        My Profile
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-80">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                            <div className="text-center">
                                {/* Avatar */}
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 
                                                  flex items-center justify-center text-white text-3xl font-bold
                                                  shadow-lg shadow-green-500/25">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <label htmlFor="avatar-upload" 
                                           className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700
                                                    rounded-full shadow-lg flex items-center justify-center
                                                    cursor-pointer hover:bg-green-500 hover:text-white
                                                    transition-colors duration-200
                                                    border-2 border-white dark:border-slate-800">
                                        <FiCamera className="w-4 h-4" />
                                    </label>
                                    <input 
                                        type="file" 
                                        id="avatar-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {user?.name}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    {user?.email}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-500">
                                            {orderStats.total || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Total
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-500">
                                            {orderStats.delivered || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Delivered
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-500">
                                            {orderStats.cancelled || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Cancelled
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-green-500 text-white'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }
                                    `}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 mt-2
                                         text-red-600 dark:text-red-400
                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                         rounded-xl transition-all duration-200"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl 
                                             border border-slate-200 dark:border-slate-700
                                             overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Personal Information
                                            </h2>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-4 py-2
                                                             text-green-500 hover:text-green-600
                                                             border border-green-200 dark:border-green-800
                                                             rounded-lg hover:bg-green-50 
                                                             dark:hover:bg-green-900/20
                                                             transition-colors duration-200"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                    <span>Edit Profile</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="p-6">
                                        <div className="space-y-6">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`
                                                            w-full pl-10 pr-4 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.name 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            ${!isEditing && 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed'}
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        value={profile.email}
                                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`
                                                            w-full pl-10 pr-4 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.email 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            ${!isEditing && 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed'}
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        value={profile.phone}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`
                                                            w-full pl-10 pr-4 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.phone 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            ${!isEditing && 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed'}
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                                )}
                                            </div>

                                            {/* Address Section */}
                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                                    Delivery Address
                                                </h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Street */}
                                                    <div className="md:col-span-2">
                                                        <div className="relative">
                                                            <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={profile.address.street}
                                                                onChange={(e) => setProfile({
                                                                    ...profile,
                                                                    address: { ...profile.address, street: e.target.value }
                                                                })}
                                                                disabled={!isEditing}
                                                                placeholder="Street Address"
                                                                className="w-full pl-10 pr-4 py-3 rounded-xl
                                                                         border border-slate-200 dark:border-slate-700
                                                                         disabled:bg-slate-50 dark:disabled:bg-slate-900
                                                                         dark:bg-slate-800 dark:text-white
                                                                         focus:border-green-500 transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* City */}
                                                    <div>
                                                        <div className="relative">
                                                            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={profile.address.city}
                                                                onChange={(e) => setProfile({
                                                                    ...profile,
                                                                    address: { ...profile.address, city: e.target.value }
                                                                })}
                                                                disabled={!isEditing}
                                                                placeholder="City"
                                                                className="w-full pl-10 pr-4 py-3 rounded-xl
                                                                         border border-slate-200 dark:border-slate-700
                                                                         disabled:bg-slate-50 dark:disabled:bg-slate-900
                                                                         dark:bg-slate-800 dark:text-white
                                                                         focus:border-green-500 transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* State */}
                                                    <div>
                                                        <div className="relative">
                                                            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={profile.address.state}
                                                                onChange={(e) => setProfile({
                                                                    ...profile,
                                                                    address: { ...profile.address, state: e.target.value }
                                                                })}
                                                                disabled={!isEditing}
                                                                placeholder="State"
                                                                className="w-full pl-10 pr-4 py-3 rounded-xl
                                                                         border border-slate-200 dark:border-slate-700
                                                                         disabled:bg-slate-50 dark:disabled:bg-slate-900
                                                                         dark:bg-slate-800 dark:text-white
                                                                         focus:border-green-500 transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* ZIP Code */}
                                                    <div className="md:col-span-2">
                                                        <div className="relative">
                                                            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={profile.address.zipCode}
                                                                onChange={(e) => setProfile({
                                                                    ...profile,
                                                                    address: { ...profile.address, zipCode: e.target.value }
                                                                })}
                                                                disabled={!isEditing}
                                                                placeholder="ZIP Code"
                                                                className="w-full pl-10 pr-4 py-3 rounded-xl
                                                                         border border-slate-200 dark:border-slate-700
                                                                         disabled:bg-slate-50 dark:disabled:bg-slate-900
                                                                         dark:bg-slate-800 dark:text-white
                                                                         focus:border-green-500 transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {isEditing && (
                                                <div className="flex items-center gap-3 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600
                                                                 text-white font-medium rounded-xl
                                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                                 transition-colors duration-200
                                                                 flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white/30 
                                                                              border-t-white rounded-full animate-spin" />
                                                                <span>Saving...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiCheck className="w-5 h-5" />
                                                                <span>Save Changes</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setErrors({});
                                                        }}
                                                        className="px-6 py-3 border border-slate-200 dark:border-slate-700
                                                                 text-slate-600 dark:text-slate-400
                                                                 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800
                                                                 transition-colors duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl 
                                             border border-slate-200 dark:border-slate-700
                                             overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Security Settings
                                        </h2>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="p-6">
                                        <div className="space-y-6">
                                            {/* Current Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        value={password.currentPassword}
                                                        onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                                                        className={`
                                                            w-full pl-10 pr-12 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.currentPassword 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    >
                                                        {showPassword.current ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                                {errors.currentPassword && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        value={password.newPassword}
                                                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                                                        className={`
                                                            w-full pl-10 pr-12 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.newPassword 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    >
                                                        {showPassword.new ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                                {errors.newPassword && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                                                )}
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Password must be at least 6 characters with uppercase, lowercase and number
                                                </p>
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        value={password.confirmPassword}
                                                        onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                                                        className={`
                                                            w-full pl-10 pr-4 py-3 rounded-xl
                                                            border transition-colors duration-200
                                                            ${errors.confirmPassword 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                            }
                                                            dark:bg-slate-800 dark:text-white
                                                        `}
                                                    />
                                                </div>
                                                {errors.confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full px-6 py-3 bg-green-500 hover:bg-green-600
                                                             text-white font-medium rounded-xl
                                                             disabled:opacity-50 disabled:cursor-not-allowed
                                                             transition-colors duration-200
                                                             flex items-center justify-center gap-2"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 
                                                                          border-t-white rounded-full animate-spin" />
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiShield className="w-5 h-5" />
                                                            <span>Update Password</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <motion.div
                                    key="preferences"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl 
                                             border border-slate-200 dark:border-slate-700
                                             overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Notification Preferences
                                        </h2>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {/* Email Notifications */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <FiMail className="w-5 h-5 text-green-500 mt-0.5" />
                                                    <div>
                                                        <h3 className="font-medium text-slate-900 dark:text-white">
                                                            Email Notifications
                                                        </h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Receive order updates and promotions via email
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={profile.preferences.emailNotifications}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            preferences: {
                                                                ...profile.preferences,
                                                                emailNotifications: e.target.checked
                                                            }
                                                        })}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none 
                                                                  rounded-full peer dark:bg-slate-600
                                                                  peer-checked:after:translate-x-full 
                                                                  peer-checked:after:border-white after:content-[''] 
                                                                  after:absolute after:top-[2px] after:left-[2px] 
                                                                  after:bg-white after:border-slate-300 after:border 
                                                                  after:rounded-full after:h-5 after:w-5 after:transition-all
                                                                  peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>

                                            {/* Push Notifications */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <FiSmartphone className="w-5 h-5 text-green-500 mt-0.5" />
                                                    <div>
                                                        <h3 className="font-medium text-slate-900 dark:text-white">
                                                            Push Notifications
                                                        </h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Get real-time order updates on your device
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={profile.preferences.pushNotifications}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            preferences: {
                                                                ...profile.preferences,
                                                                pushNotifications: e.target.checked
                                                            }
                                                        })}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none 
                                                                  rounded-full peer dark:bg-slate-600
                                                                  peer-checked:after:translate-x-full 
                                                                  peer-checked:after:border-white after:content-[''] 
                                                                  after:absolute after:top-[2px] after:left-[2px] 
                                                                  after:bg-white after:border-slate-300 after:border 
                                                                  after:rounded-full after:h-5 after:w-5 after:transition-all
                                                                  peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>

                                            {/* SMS Notifications */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <FiPhone className="w-5 h-5 text-green-500 mt-0.5" />
                                                    <div>
                                                        <h3 className="font-medium text-slate-900 dark:text-white">
                                                            SMS Notifications
                                                        </h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Receive text messages for order status
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={profile.preferences.smsNotifications}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            preferences: {
                                                                ...profile.preferences,
                                                                smsNotifications: e.target.checked
                                                            }
                                                        })}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none 
                                                                  rounded-full peer dark:bg-slate-600
                                                                  peer-checked:after:translate-x-full 
                                                                  peer-checked:after:border-white after:content-[''] 
                                                                  after:absolute after:top-[2px] after:left-[2px] 
                                                                  after:bg-white after:border-slate-300 after:border 
                                                                  after:rounded-full after:h-5 after:w-5 after:transition-all
                                                                  peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Save Preferences Button */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => {
                                                    toast.success('Preferences saved!');
                                                }}
                                                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600
                                                         text-white font-medium rounded-xl
                                                         transition-colors duration-200"
                                            >
                                                Save Preferences
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl 
                                             border border-slate-200 dark:border-slate-700
                                             overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Order History
                                        </h2>
                                    </div>
                                    <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                                        <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>View your full order history in the Orders section</p>
                                        <button
                                            onClick={() => navigate('/orders')}
                                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg
                                                     hover:bg-green-600 transition-colors"
                                        >
                                            Go to Orders
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Payment Tab */}
                            {activeTab === 'payment' && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl 
                                             border border-slate-200 dark:border-slate-700
                                             overflow-hidden"
                                >
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Payment Methods
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        {/* Sample payment methods */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                                                        VISA
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">•••• 4242</p>
                                                        <p className="text-sm text-slate-500">Expires 12/24</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Default
                                                </span>
                                            </div>
                                            
                                            <button className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700
                                                             rounded-xl text-slate-500 hover:border-green-500
                                                             hover:text-green-500 transition-colors">
                                                + Add Payment Method
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
