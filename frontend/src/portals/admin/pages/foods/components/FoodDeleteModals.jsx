import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiAlertCircle } from 'react-icons/fi';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

const FoodDeleteModals = ({
    deleteTarget,
    onCloseDelete,
    onConfirmDelete,
    bulkDeleteTarget,
    selectedCount,
    onCloseBulkDelete,
    onConfirmBulkDelete
}) => {
    return (
        <>
            {/* Single Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseDelete}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Delete Food Item
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>? 
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onCloseDelete}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => onConfirmDelete(deleteTarget._id)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg text-sm hover:bg-red-600
                                                 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirmation Modal */}
            <AnimatePresence>
                {bulkDeleteTarget && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseBulkDelete}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Delete Multiple Items
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Are you sure you want to delete {selectedCount} food items? 
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onCloseBulkDelete}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirmBulkDelete}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg text-sm hover:bg-red-600
                                                 transition-colors"
                                    >
                                        Delete All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FoodDeleteModals;
