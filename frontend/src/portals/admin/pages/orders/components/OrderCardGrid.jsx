import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiEye, FiPrinter, FiMail, FiMessageSquare } from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';

const OrderCardGrid = ({
    orders,
    isLoading,
    totalItems,
    selectedOrders,
    areAllVisibleSelected,
    toggleSelectAllVisible,
    toggleOrderSelection,
    onViewOrder,
    onPrintOrder,
    onSendEmail,
    onSendSMS,
    pagination,
    goToPage,
    setPageSize
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            {/* Selection and Count Header */}
            <div className="flex items-center justify-between mb-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={areAllVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Select all on this page</span>
                </label>
                <span className="text-xs text-slate-500">
                    {totalItems || 0} total orders
                </span>
            </div>

            {/* Main Cards Body */}
            {isLoading ? (
                <div className="py-16 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">No data available</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add new data</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            layout
                            className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/40 dark:bg-slate-900/30 hover:border-primary-400 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">Order</p>
                                    <p className="font-mono font-semibold text-slate-900 dark:text-white">
                                        #{order.orderNumber}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order._id)}
                                    onChange={() => toggleOrderSelection(order._id)}
                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-1 cursor-pointer"
                                />
                            </div>

                            <div className="mt-3 space-y-1 text-sm">
                                <p className="text-slate-900 dark:text-white font-medium">
                                    {order.customer?.name || "N/A"}
                                </p>
                                <p className="text-slate-500 truncate text-xs">
                                    {order.customer?.email || "No email"}
                                </p>
                                <p className="text-slate-700 dark:text-slate-200 font-semibold text-base pt-1">
                                    ${Number(order.totalAmount || 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <StatusBadge status={order.orderStatus} type="order" variant="pill" showIcon />
                                <StatusBadge status={order.paymentStatus} type="payment" variant="dot" />
                            </div>

                            <div className="mt-3 text-xs text-slate-500 space-y-1">
                                <p>{order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy • h:mm a") : 'N/A'}</p>
                                <p>Payment: {(order.paymentMethod || "N/A").replace("_", " ")}</p>
                                <p>Driver: {order.driver?.name || "Unassigned"}</p>
                            </div>

                            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => onViewOrder(order._id)}
                                    className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    title="View Order"
                                >
                                    <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onPrintOrder(order)}
                                    className="p-1.5 text-slate-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded transition-colors"
                                    title="Print Order"
                                >
                                    <FiPrinter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onSendEmail(order)}
                                    className="p-1.5 text-slate-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                    title="Send Email"
                                >
                                    <FiMail className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onSendSMS(order)}
                                    className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                    title="Send SMS"
                                >
                                    <FiMessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Rows:</span>
                    <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToPage(Math.max(1, pagination.currentPage - 1))}
                        disabled={pagination.currentPage <= 1}
                        className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                        Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </span>
                    <button
                        onClick={() => goToPage(Math.min(pagination.totalPages || 1, pagination.currentPage + 1))}
                        disabled={pagination.currentPage >= (pagination.totalPages || 1)}
                        className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCardGrid;
