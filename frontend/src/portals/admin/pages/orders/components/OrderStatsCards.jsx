import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';

const OrderStatsCards = ({ stats }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.totalOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.totalRevenue?.toFixed(2) || "0"}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Avg Order Value</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.averageOrderValue?.toFixed(2) || "0"}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.pendingOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-yellow-600" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderStatsCards;
