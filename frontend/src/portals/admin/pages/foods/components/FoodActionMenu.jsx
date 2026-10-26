import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMoreVertical, 
    FiEye, 
    FiEdit2, 
    FiTrash2, 
    FiCheckCircle, 
    FiSlash 
} from 'react-icons/fi';

const FoodActionMenu = ({
    food,
    onView,
    onEdit,
    onDelete,
    onToggleAvailability
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const isAvailable = food.available ?? food.isAvailable;

    return (
        <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isOpen 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="More actions"
                aria-expanded={isOpen}
            >
                <FiMoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 focus:outline-none"
                    >
                        {/* View Details */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onView?.(food);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                            <FiEye className="w-4 h-4 text-primary-500" />
                            <span>View Details</span>
                        </button>

                        {/* Edit Food */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onEdit?.(food);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4 text-blue-500" />
                            <span>Edit Food</span>
                        </button>

                        {/* Toggle Availability */}
                        {onToggleAvailability && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onToggleAvailability(food);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                            >
                                {isAvailable ? (
                                    <>
                                        <FiSlash className="w-4 h-4 text-amber-500" />
                                        <span>Mark Out of Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>Mark In Stock</span>
                                    </>
                                )}
                            </button>
                        )}

                        <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />

                        {/* Delete Food */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onDelete?.(food);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                        >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                            <span>Delete Food</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodActionMenu;
