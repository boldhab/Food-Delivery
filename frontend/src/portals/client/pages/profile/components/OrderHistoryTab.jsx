import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage } from 'react-icons/fi';

const OrderHistoryTab = ({ onNavigateOrders }) => {
    return (
        <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl 
                     border border-slate-200 dark:border-slate-700
                     overflow-hidden"
        >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Order History
                </h2>
            </div>
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>View your full order history in the Orders section</p>
                <button
                    onClick={onNavigateOrders}
                    className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-lg
                             hover:opacity-90 transition-colors"
                >
                    Go to Orders
                </button>
            </div>
        </motion.div>
    );
};

export default OrderHistoryTab;
