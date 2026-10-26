import React from 'react';
import { motion } from 'framer-motion';

const BulkActionsBar = ({
    selectedCount,
    onBulkUpdate,
    onOpenBulkDelete,
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
            <span className="text-sm font-medium">
                {selectedCount} items selected
            </span>
            
            <div className="h-6 w-px bg-slate-200 dark:border-slate-700" />

            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === "available" || value === "unavailable") {
                        onBulkUpdate({ available: value === "available" });
                    } else if (value === "delete") {
                        onOpenBulkDelete();
                    }
                    e.target.value = "";
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
                         border border-transparent rounded-lg text-sm
                         focus:outline-none focus:border-primary-500"
            >
                <option value="">Bulk Actions</option>
                <option value="available">Mark as Available</option>
                <option value="unavailable">Mark as Unavailable</option>
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

export default BulkActionsBar;
