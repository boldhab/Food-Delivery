import React, { useState } from 'react';
import { FiClock, FiPlus, FiCheck, FiStar, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import resolveImageUrl from '../../utils/image';

const FoodCard = ({ food, variant = 'grid', onQuickView }) => {
    const { isAuthenticated } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    
    const [isAdding, setIsAdding] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Calculate discounted price if any
    const originalPrice = food.price;
    const discountedPrice = food.discount 
        ? food.price * (1 - food.discount / 100) 
        : null;
    
    const displayPrice = discountedPrice || originalPrice;

    const handleAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to add items', {
                icon: '🔒',
                duration: 3000,
                position: 'bottom-center',
            });
            navigate('/login', { state: { from: '/menu' } });
            return;
        }

        setIsAdding(true);
        try {
            await addItem(food._id, 1);
            toast.success(
                <div className="flex items-center gap-2">
                    <span>✅</span>
                    <div>
                        <strong>{food.name}</strong>
                        <div className="text-xs opacity-90">added to cart</div>
                    </div>
                </div>,
                {
                    duration: 2000,
                    position: 'bottom-center',
                    icon: '🛒',
                }
            );
            
            // Optional: trigger a small confetti or animation
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to add item', {
                duration: 3000,
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) {
            onQuickView(food);
        }
    };

    // Grid view (default) - Best for menu grids
    if (variant === 'grid') {
        return (
            <motion.article
                className="group relative bg-white dark:bg-slate-800 
                         rounded-2xl overflow-hidden
                         border border-slate-200 dark:border-slate-700
                         hover:border-green-200 dark:hover:border-green-800
                         hover:shadow-xl hover:shadow-green-500/5
                         transition-all duration-300
                         cursor-pointer"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/food/${food._id}`)}
            >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {/* Skeleton loader */}
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 
                                      dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
                                      animate-shimmer bg-[length:200%_100%]" />
                    )}
                    
                    {/* Food Image */}
                    <img
                        src={imageError ? resolveImageUrl('') : resolveImageUrl(food.image)}
                        alt={food.name}
                        className={`w-full h-full object-cover
                                 transition-transform duration-500
                                 group-hover:scale-110
                                 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {food.isPopular && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold
                                           rounded-full shadow-lg flex items-center gap-1">
                                🔥 Popular
                            </span>
                        )}
                        {food.discount && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold
                                           rounded-full shadow-lg">
                                -{food.discount}%
                            </span>
                        )}
                        {food.isVegetarian && (
                            <span className="w-6 h-6 bg-green-500 text-white text-xs
                                           rounded-full flex items-center justify-center
                                           shadow-lg">
                                🌱
                            </span>
                        )}
                    </div>

                    {/* Preparation time badge */}
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm 
                                       text-slate-700 text-xs font-medium
                                       rounded-full shadow-lg
                                       flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {food.preparationTime || 15} min
                        </span>
                    </div>

                    {/* Quick view button (appears on hover) */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                onClick={handleQuickView}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2
                                         px-4 py-2 bg-white text-slate-700
                                         rounded-full shadow-lg
                                         hover:bg-green-500 hover:text-white
                                         transition-colors duration-200
                                         flex items-center gap-2 text-sm font-medium
                                         z-10"
                            >
                                <FiInfo className="w-4 h-4" />
                                Quick View
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Restaurant name (if available) */}
                    {food.restaurant && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            {food.restaurant.name}
                        </p>
                    )}

                    {/* Name and rating row */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white 
                                     line-clamp-1 flex-1">
                            {food.name}
                        </h3>
                        {food.rating && (
                            <div className="flex items-center gap-1 text-sm 
                                          text-slate-600 dark:text-slate-400 ml-2">
                                <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{food.rating.toFixed(1)}</span>
                                {food.totalReviews && (
                                    <span className="text-xs text-slate-400">
                                        ({food.totalReviews})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 
                               line-clamp-2 mb-3">
                        {food.description}
                    </p>

                    {/* Tags */}
                    {food.tags && food.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {food.tags.slice(0, 3).map((tag) => (
                                <span 
                                    key={tag}
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700
                                             text-slate-600 dark:text-slate-400
                                             text-xs rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price and Add to cart row */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-green-500">
                                ${displayPrice.toFixed(2)}
                            </span>
                            {discountedPrice && (
                                <span className="text-sm text-slate-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <motion.button
                            onClick={handleAdd}
                            disabled={isAdding}
                            className="relative px-4 py-2 bg-green-500 hover:bg-green-600
                                     disabled:bg-green-300 disabled:cursor-not-allowed
                                     text-white rounded-xl
                                     transition-colors duration-200
                                     flex items-center gap-2 text-sm font-medium
                                     shadow-lg shadow-green-500/25
                                     hover:shadow-green-500/35
                                     overflow-hidden
                                     group/add"
                            whileTap={{ scale: 0.95 }}
                        >
                            <AnimatePresence mode="wait">
                                {isAdding ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-4 h-4 border-2 border-white/30 
                                                      border-t-white rounded-full animate-spin" />
                                        <span>Adding...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="add"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <FiPlus className="w-4 h-4 group-hover/add:rotate-90 
                                                         transition-transform duration-300" />
                                        <span>Add</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>

                {/* Success overlay animation */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-green-500/10 pointer-events-none
                                     flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-16 h-16 bg-green-500 rounded-full
                                         flex items-center justify-center text-white text-2xl"
                            >
                                <FiCheck />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.article>
        );
    }

    // List view - Better for search results or detailed browsing
    if (variant === 'list') {
        return (
            <motion.article
                className="group relative bg-white dark:bg-slate-800 
                         rounded-2xl overflow-hidden
                         border border-slate-200 dark:border-slate-700
                         hover:border-green-200 dark:hover:border-green-800
                         hover:shadow-xl transition-all duration-300
                         flex flex-col sm:flex-row
                         cursor-pointer"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => navigate(`/food/${food._id}`)}
            >
                {/* Image - smaller in list view */}
                <div className="sm:w-48 h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                        src={resolveImageUrl(food.image)}
                        alt={food.name}
                        className="w-full h-full object-cover
                                 transition-transform duration-500
                                 group-hover:scale-110"
                        loading="lazy"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                        {food.isPopular && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                🔥
                            </span>
                        )}
                        {food.isVegetarian && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                🌱
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {food.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {food.description}
                        </p>
                        
                        {/* Extended details for list view */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {food.preparationTime || 15} min
                            </span>
                            {food.rating && (
                                <span className="flex items-center gap-1">
                                    <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {food.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Price and action */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-500">
                                ${displayPrice.toFixed(2)}
                            </span>
                            {discountedPrice && (
                                <span className="text-sm text-slate-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={isAdding}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600
                                     disabled:bg-green-300
                                     text-white rounded-xl
                                     transition-colors duration-200
                                     flex items-center gap-2 font-medium"
                        >
                            {isAdding ? (
                                <>Adding...</>
                            ) : (
                                <>
                                    <FiPlus className="w-4 h-4" />
                                    Add to cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.article>
        );
    }

    // Compact view - For sidebars or recommendations
    return (
        <motion.article
            className="group flex items-center gap-3 p-2
                     rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800
                     transition-colors duration-200
                     cursor-pointer"
            whileHover={{ x: 4 }}
            onClick={() => navigate(`/food/${food._id}`)}
        >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                    src={resolveImageUrl(food.image)}
                    alt={food.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white">
                    {food.name}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    ${displayPrice.toFixed(2)}
                </p>
            </div>
            <button
                onClick={handleAdd}
                className="p-2 bg-green-500 hover:bg-green-600
                         text-white rounded-lg
                         transition-colors duration-200"
            >
                <FiPlus className="w-4 h-4" />
            </button>
        </motion.article>
    );
};

export default FoodCard;
