import React from 'react';
import { motion } from 'framer-motion';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiHome, 
    FiMapPin, 
    FiGlobe, 
    FiEdit2, 
    FiCheck 
} from 'react-icons/fi';

const PersonalInfoTab = ({
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    errors,
    setErrors,
    loading,
    handleProfileUpdate
}) => {
    return (
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
    );
};

export default PersonalInfoTab;
