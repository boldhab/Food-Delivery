import React from 'react';
import { motion } from 'framer-motion';

export const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
];

const ReportFilters = ({ filters, setFilters, comparison, setComparison }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.customStart}
                  onChange={(e) => setFilters((prev) => ({ ...prev, customStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.customEnd}
                  onChange={(e) => setFilters((prev) => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="pizza">Pizza</option>
              <option value="burger">Burger</option>
              <option value="sushi">Sushi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Min Amount (ETB)
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Max Amount (ETB)
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
              placeholder="1000"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={comparison}
              onChange={(e) => setComparison(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            Compare with previous period
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportFilters;
