import React from 'react';
import { motion } from 'framer-motion';

const OrderFilters = ({
    activeStatus,
    routeStatus,
    localFilters,
    setLocalFilters,
    statusOptions,
    paymentStatusOptions,
    paymentMethodOptions,
    dateRangeOptions,
    handleClearFilters,
    onStatusNavigateReset
}) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
        >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Order Status
                        </label>
                        <select
                            value={activeStatus}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
                            disabled={Boolean(routeStatus)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Status
                        </label>
                        <select
                            value={localFilters.paymentStatus}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {paymentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Method
                        </label>
                        <select
                            value={localFilters.paymentMethod}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {paymentMethodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Date Range
                        </label>
                        <select
                            value={localFilters.dateRange}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {dateRangeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Date Range */}
                    {localFilters.dateRange === "custom" && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.startDate}
                                    onChange={(e) => setLocalFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.endDate}
                                    onChange={(e) => setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
                                />
                            </div>
                        </>
                    )}

                    {/* Amount Range */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Min Amount
                        </label>
                        <input
                            type="number"
                            value={localFilters.minAmount}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Max Amount
                        </label>
                        <input
                            type="number"
                            value={localFilters.maxAmount}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                            placeholder="1000"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        />
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {activeStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                Status: {statusOptions.find((o) => o.value === activeStatus)?.label}
                                <button onClick={onStatusNavigateReset}>×</button>
                            </span>
                        )}
                        {localFilters.paymentStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                Payment: {paymentStatusOptions.find((o) => o.value === localFilters.paymentStatus)?.label}
                                <button onClick={() => setLocalFilters((prev) => ({ ...prev, paymentStatus: "" }))}>×</button>
                            </span>
                        )}
                        {localFilters.dateRange !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                {dateRangeOptions.find((o) => o.value === localFilters.dateRange)?.label}
                                <button onClick={() => setLocalFilters((prev) => ({ ...prev, dateRange: "all" }))}>×</button>
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderFilters;
