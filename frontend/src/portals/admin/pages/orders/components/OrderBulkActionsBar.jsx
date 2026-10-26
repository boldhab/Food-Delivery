import React from 'react';
import { motion } from 'framer-motion';

const OrderBulkActionsBar = ({
    selectedCount,
    onBulkUpdate,
    onBulkDelete,
    onCancel
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                     bg-white dark:bg-slate-800 rounded-xl shadow-2xl
                     border border-slate-200 dark:border-slate-700
                     p-4 flex items-center gap-4"
        >
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {selectedCount} orders selected
            </span>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === "confirmed" || value === "preparing" || value === "out_for_delivery" || value === "delivered") {
                        onBulkUpdate({ orderStatus: value });
                    } else if (value === "delete") {
                        onBulkDelete();
                    }
                    e.target.value = "";
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
                         border border-transparent rounded-lg text-sm
                         focus:outline-none focus:border-primary-500"
            >
                <option value="">Bulk Actions</option>
                <optgroup label="Update Status">
                    <option value="confirmed">Mark as Confirmed</option>
                    <option value="preparing">Mark as Preparing</option>
                    <option value="out_for_delivery">Mark as Out for Delivery</option>
                    <option value="delivered">Mark as Delivered</option>
                </optgroup>
                <option value="delete" className="text-red-500">Delete Selected</option>
            </select>

            <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
            >
                Cancel
            </button>
        </motion.div>
    );
};

export default OrderBulkActionsBar;
