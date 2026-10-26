import React from 'react';
import { motion } from 'framer-motion';

const OrderEmptyState = ({ onBrowseMenu }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No orders yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Looks like you haven't placed any orders yet. 
                Ready to order something delicious?
            </p>
            <button
                onClick={onBrowseMenu}
                className="px-6 py-3 bg-green-500 hover:bg-green-600
                         text-white font-medium rounded-xl
                         transition-colors duration-200
                         shadow-lg shadow-green-500/25"
            >
                Browse Menu
            </button>
        </motion.div>
    );
};

export default OrderEmptyState;
