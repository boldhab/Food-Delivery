import React from 'react';
import { FiCamera, FiLogOut } from 'react-icons/fi';

const ProfileSidebar = ({
    user,
    orderStats,
    tabs,
    activeTab,
    setActiveTab,
    handleImageUpload,
    handleLogout
}) => {
    return (
        <div className="lg:w-80">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-500 
                                      flex items-center justify-center text-white text-3xl font-bold
                                      shadow-lg shadow-[var(--primary)]/25">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <label 
                            htmlFor="avatar-upload" 
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700
                                     rounded-full shadow-lg flex items-center justify-center
                                     cursor-pointer hover:bg-[var(--primary)] hover:text-white
                                     transition-colors duration-200
                                     border-2 border-white dark:border-slate-800"
                        >
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
                            <div className="text-xl font-bold text-[var(--primary)]">
                                {orderStats.total || 0}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Total
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-[var(--primary)]">
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
                                ? 'bg-[var(--primary)] text-white'
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
    );
};

export default ProfileSidebar;
