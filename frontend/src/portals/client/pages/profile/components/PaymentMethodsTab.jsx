import React from 'react';
import { motion } from 'framer-motion';

const PaymentMethodsTab = () => {
    return (
        <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl 
                     border border-slate-200 dark:border-slate-700
                     overflow-hidden"
        >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Payment Methods
                </h2>
            </div>
            <div className="p-6">
                {/* Sample payment methods */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                                VISA
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">•••• 4242</p>
                                <p className="text-sm text-slate-500">Expires 12/24</p>
                            </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                        </span>
                    </div>
                    
                    <button className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-500 hover:border-green-500
                                     hover:text-green-500 transition-colors">
                        + Add Payment Method
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentMethodsTab;
