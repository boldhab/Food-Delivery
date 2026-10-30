import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

const SecurityTab = ({
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    loading,
    handlePasswordChange
}) => {
    return (
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
                                        : 'border-slate-200 dark:border-slate-700 focus:border-[var(--primary)]'
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
                                        : 'border-slate-200 dark:border-slate-700 focus:border-[var(--primary)]'
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
                                        : 'border-slate-200 dark:border-slate-700 focus:border-[var(--primary)]'
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
                            className="w-full px-6 py-3 bg-[var(--primary)] hover:opacity-90
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
    );
};

export default SecurityTab;
