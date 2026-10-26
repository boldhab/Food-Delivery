import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const OrdersHeader = ({
    orderCount,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    onRefresh,
    refreshing
}) => {
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                            My Orders
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 tabular-nums">
                            {orderCount} {orderCount === 1 ? 'order' : 'orders'} found
                        </p>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2
                                 bg-white dark:bg-slate-800
                                 border border-slate-200 dark:border-slate-700
                                 rounded-lg text-slate-700 dark:text-slate-300
                                 hover:border-green-500 transition-colors
                                 disabled:opacity-50"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mt-6">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800
                                 border border-slate-200 dark:border-slate-700
                                 rounded-lg text-slate-700 dark:text-slate-300
                                 focus:outline-none focus:border-green-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800
                                 border border-slate-200 dark:border-slate-700
                                 rounded-lg text-slate-700 dark:text-slate-300
                                 focus:outline-none focus:border-green-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Amount</option>
                        <option value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default OrdersHeader;
