import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX,
    FiStar,
    FiClock,
    FiPackage,
    FiDollarSign,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiSlash,
    FiAlertTriangle,
    FiTag,
    FiImage
} from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/adminHelpers';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};

const FoodDetailModal = ({
    food,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onToggleAvailability
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !food) return null;

    const isAvailable = food.available ?? food.isAvailable;
    const price = Number(food.price || 0);
    const discount = Number(food.discount || 0);
    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    const rating = Number(food.rating || 0);
    const totalReviews = food.totalReviews ?? food.numReviews ?? 0;
    const orderCount = food.stats?.orderCount ?? food.orderCount ?? 0;
    const prepTime = Number(food.preparationTime || 15);

    const nutrition = food.nutritionalInfo || {
        calories: food.calories || 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
    };

    const hasNutrition = (nutrition.calories > 0 || nutrition.protein > 0 || nutrition.carbs > 0 || nutrition.fat > 0);
    const ingredients = Array.isArray(food.ingredients) ? food.ingredients : [];
    const allergens = Array.isArray(food.allergens) ? food.allergens : [];

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col"
                >
                    {/* Header Image & Hero */}
                    <div className="relative h-56 sm:h-64 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                        {food.image ? (
                            <img
                                src={food.image}
                                alt={food.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <FiImage className="w-12 h-12 mb-2" />
                                <span className="text-xs">No image provided</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        {/* Top Action Buttons Overlay */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                                title="Close"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Badges on Top Left */}
                        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                            <StatusBadge status={isAvailable} type="food" variant="pill" showIcon />
                            {discount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                    {discount}% OFF
                                </span>
                            )}
                            {food.isFeatured && (
                                <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                                    ★ Featured
                                </span>
                            )}
                            {food.isPopular && (
                                <span className="bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                                    🔥 Popular
                                </span>
                            )}
                        </div>

                        {/* Title and Category over Image */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {food.category && (
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-0.5 rounded-lg">
                                        {food.category}
                                    </span>
                                )}
                                {food.cuisine && (
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-0.5 rounded-lg">
                                        {food.cuisine} Cuisine
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                                {food.name}
                            </h2>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* Price */}
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Price
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                        {formatCurrency(discountedPrice)}
                                    </span>
                                    {discount > 0 && (
                                        <span className="text-xs text-slate-400 line-through tabular-nums">
                                            {formatCurrency(price)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Prep Time */}
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Prep Time
                                </span>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tabular-nums">
                                    <FiClock className="w-4 h-4 text-primary-500" />
                                    <span>{prepTime} min</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Customer Rating
                                </span>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tabular-nums">
                                    <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span>{rating.toFixed(1)}</span>
                                    <span className="text-xs font-normal text-slate-400 tabular-nums">({totalReviews})</span>
                                </div>
                            </div>

                            {/* Total Orders */}
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Sold
                                </span>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tabular-nums">
                                    <FiPackage className="w-4 h-4 text-blue-500" />
                                    <span>{orderCount} orders</span>
                                </div>
                            </div>
                        </div>

                        {/* Dietary Preferences Tags */}
                        <div className="flex flex-wrap gap-2">
                            {food.isVegetarian && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                    🌱 Vegetarian
                                </span>
                            )}
                            {food.isVegan && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/40">
                                    🌿 Vegan
                                </span>
                            )}
                            {food.isGlutenFree && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                    🌾 Gluten Free
                                </span>
                            )}
                            {food.isSpicy && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                                    🌶️ Spicy
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Description
                            </h4>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                {food.description || "No description provided for this food item."}
                            </p>
                        </div>

                        {/* Ingredients */}
                        {ingredients.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Ingredients ({ingredients.length})
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {ingredients.map((ing, i) => (
                                        <span 
                                            key={i}
                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                                        >
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Allergens Warning */}
                        {allergens.length > 0 && (
                            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
                                <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                                        Allergen Information
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allergens.map((alg, i) => (
                                            <span 
                                                key={i}
                                                className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded text-xs font-medium"
                                            >
                                                {alg}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Nutrition Facts */}
                        {hasNutrition && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Nutritional Information
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block">Calories</span>
                                        <span className="text-base font-bold text-slate-800 dark:text-white">
                                            {nutrition.calories} kcal
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block">Protein</span>
                                        <span className="text-base font-bold text-slate-800 dark:text-white">
                                            {nutrition.protein || 0} g
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block">Carbs</span>
                                        <span className="text-base font-bold text-slate-800 dark:text-white">
                                            {nutrition.carbs || 0} g
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-xs text-slate-400 block">Fat</span>
                                        <span className="text-base font-bold text-slate-800 dark:text-white">
                                            {nutrition.fat || 0} g
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadata: Created Date */}
                        {food.createdAt && (
                            <div className="text-2xs text-muted-foreground flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span>Item ID: <code className="font-mono text-muted-foreground">{food._id || food.id}</code></span>
                                <span>Added: {formatDate(food.createdAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                            {onToggleAvailability && (
                                <button
                                    onClick={() => onToggleAvailability(food)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                        isAvailable
                                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40'
                                    }`}
                                >
                                    {isAvailable ? (
                                        <>
                                            <FiSlash className="w-3.5 h-3.5" />
                                            <span>Mark Out of Stock</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle className="w-3.5 h-3.5" />
                                            <span>Mark In Stock</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onDelete(food);
                                    }}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs transition-colors"
                                    title="Delete food item"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition-colors"
                            >
                                Close
                            </button>
                            {onEdit && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onEdit(food);
                                    }}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary-500/20 transition-all"
                                >
                                    <FiEdit2 className="w-3.5 h-3.5" />
                                    <span>Edit Food Item</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FoodDetailModal;
