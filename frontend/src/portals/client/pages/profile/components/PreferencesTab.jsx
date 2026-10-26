import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSmartphone, FiPhone, FiSun } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const PreferencesTab = ({ profile, setProfile }) => {
    return (
        <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Theme & Appearance Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <FiSun className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Appearance & Theme
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Choose how Food Hub looks for you across your devices
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                                Theme Preference
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Select between Light, Dark, or automatically matching your System preference
                            </p>
                        </div>
                        <ThemeSwitcher variant="segmented" size="md" />
                    </div>
                </div>
            </div>

            {/* Notification Preferences Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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
        </div>
    </motion.div>
    );
};

export default PreferencesTab;
