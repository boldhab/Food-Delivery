import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
    FiUser, 
    FiLock, 
    FiBell, 
    FiCreditCard, 
    FiPackage 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/auth.service';
import orderService from '../services/order.service';

import ProfileSidebar from './profile/components/ProfileSidebar';
import PersonalInfoTab from './profile/components/PersonalInfoTab';
import SecurityTab from './profile/components/SecurityTab';
import PreferencesTab from './profile/components/PreferencesTab';
import OrderHistoryTab from './profile/components/OrderHistoryTab';
import PaymentMethodsTab from './profile/components/PaymentMethodsTab';

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
            country: user?.address?.country || 'Ethiopia',
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

        if (!profile.name?.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!profile.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!profile.phone?.trim()) {
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
        try {
            await logout();
        } catch {
            // continue navigation even if error occurs
        }
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
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
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        My Profile
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar
                        user={user}
                        orderStats={orderStats}
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleImageUpload={handleImageUpload}
                        handleLogout={handleLogout}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <PersonalInfoTab
                                    profile={profile}
                                    setProfile={setProfile}
                                    isEditing={isEditing}
                                    setIsEditing={setIsEditing}
                                    errors={errors}
                                    setErrors={setErrors}
                                    loading={loading}
                                    handleProfileUpdate={handleProfileUpdate}
                                />
                            )}

                            {activeTab === 'security' && (
                                <SecurityTab
                                    password={password}
                                    setPassword={setPassword}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    errors={errors}
                                    loading={loading}
                                    handlePasswordChange={handlePasswordChange}
                                />
                            )}

                            {activeTab === 'preferences' && (
                                <PreferencesTab
                                    profile={profile}
                                    setProfile={setProfile}
                                />
                            )}

                            {activeTab === 'orders' && (
                                <OrderHistoryTab
                                    onNavigateOrders={() => navigate('/orders')}
                                />
                            )}

                            {activeTab === 'payment' && (
                                <PaymentMethodsTab />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
