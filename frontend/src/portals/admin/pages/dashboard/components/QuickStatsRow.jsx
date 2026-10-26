import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiShoppingBag, FiUsers, FiPackage } from 'react-icons/fi';

const QuickStatsRow = ({
    normalizedPopularCategories,
    normalizedPeakHours,
    normalizedRecentActivity
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Popular Categories */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Popular Categories
                </h3>
                <div className="space-y-3">
                    {normalizedPopularCategories.map((cat, index) => (
                        <div key={`${cat.name}-${index}`} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {cat.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {cat.count}
                                </span>
                                <span className="text-xs text-slate-500">
                                    ({cat.percentage}%)
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Peak Order Hours
                </h3>
                <div className="space-y-3">
                    {normalizedPeakHours.map((hour, index) => (
                        <div key={`${hour.hour}-${index}`} className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-16">
                                {hour.hour}:00
                            </span>
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hour.percentage}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="h-full bg-primary-600 rounded-full"
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                                {hour.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {normalizedRecentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                ${activity.type === "order" && "bg-blue-100 text-blue-500"}
                                ${activity.type === "user" && "bg-green-100 text-green-500"}
                                ${activity.type === "food" && "bg-primary-100 text-primary-600"}
                            `}>
                                {activity.type === "order" && <FiShoppingBag className="w-4 h-4" />}
                                {activity.type === "user" && <FiUsers className="w-4 h-4" />}
                                {activity.type === "food" && <FiPackage className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {activity.message}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {format(new Date(activity.timestamp), "HH:mm:ss")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickStatsRow;
