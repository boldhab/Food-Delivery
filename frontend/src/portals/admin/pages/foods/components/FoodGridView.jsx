import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiEdit2, FiTrash2, FiImage, FiEye } from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';

const FoodGridView = ({
    foods,
    onEdit,
    onDelete,
    onView,
    onToggleAvailability,
    selectedFoods,
    onSelectFood
}) => {
    if (!foods || foods.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FiImage className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No food items found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => {
                const isSelected = selectedFoods?.includes(food._id);
                return (
                    <motion.div
                        key={food._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group ${
                            isSelected 
                                ? 'border-primary-500 ring-2 ring-primary-500/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:shadow-lg'
                        }`}
                    >
                        {/* Image Header */}
                        <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            {food.image ? (
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <FiImage className="w-10 h-10" />
                                </div>
                            )}

                            {/* Selection Checkbox */}
                            {onSelectFood && (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onSelectFood(food._id)}
                                    className="absolute top-3 left-3 w-5 h-5 rounded text-primary-600 focus:ring-primary-500/30"
                                />
                            )}

                            {/* Discount Badge */}
                            {food.discount > 0 && (
                                <span className="absolute top-3 right-3 bg-red-500 text-white font-semibold text-xs px-2 py-0.5 rounded-full shadow">
                                    -{food.discount}%
                                </span>
                            )}

                            {/* Category Pill */}
                            <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
                                {food.category}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 
                                        onClick={() => onView?.(food)}
                                        className="font-bold text-slate-900 dark:text-white hover:text-primary-600 cursor-pointer line-clamp-1"
                                    >
                                        {food.name}
                                    </h3>
                                    <StatusBadge status={food.available} type="food" variant="pill" showIcon />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                    {food.description}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            ${Number(food.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {food.rating?.toFixed(1) || '0.0'}
                                        </span>
                                        <span className="text-slate-400">({food.totalReviews || 0})</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onView?.(food)}
                                        className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <FiEye className="w-3.5 h-3.5" />
                                        <span>View</span>
                                    </button>
                                    <button
                                        onClick={() => onEdit?.(food)}
                                        className="py-1.5 px-2 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 hover:bg-primary-100 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <FiEdit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(food)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete food item"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default FoodGridView;
