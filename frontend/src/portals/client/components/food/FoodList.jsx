import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from './FoodCard';
import { useInView } from 'react-intersection-observer';

const FoodList = ({ 
    foods = [], 
    loading = false,
    variant = 'grid',
    columns = {
        default: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 4
    },
    onLoadMore,
    hasMore = false,
    emptyMessage = 'No items found',
    emptyIcon = '🍽️',
    onFoodClick,
    showLoadMore = true
}) => {
    
    // Intersection observer for infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false
    });

    // Trigger load more when the sentinel comes into view
    React.useEffect(() => {
        if (inView && onLoadMore && hasMore && !loading) {
            onLoadMore();
        }
    }, [inView, onLoadMore, hasMore, loading]);

    // Generate grid classes based on columns prop
    const getGridClasses = () => {
        const baseClasses = 'grid gap-4 md:gap-6';
        const colMap = {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
            6: 'grid-cols-6',
        };
        const smMap = {
            1: 'sm:grid-cols-1',
            2: 'sm:grid-cols-2',
            3: 'sm:grid-cols-3',
            4: 'sm:grid-cols-4',
            5: 'sm:grid-cols-5',
            6: 'sm:grid-cols-6',
        };
        const mdMap = {
            1: 'md:grid-cols-1',
            2: 'md:grid-cols-2',
            3: 'md:grid-cols-3',
            4: 'md:grid-cols-4',
            5: 'md:grid-cols-5',
            6: 'md:grid-cols-6',
        };
        const lgMap = {
            1: 'lg:grid-cols-1',
            2: 'lg:grid-cols-2',
            3: 'lg:grid-cols-3',
            4: 'lg:grid-cols-4',
            5: 'lg:grid-cols-5',
            6: 'lg:grid-cols-6',
        };
        const xlMap = {
            1: 'xl:grid-cols-1',
            2: 'xl:grid-cols-2',
            3: 'xl:grid-cols-3',
            4: 'xl:grid-cols-4',
            5: 'xl:grid-cols-5',
            6: 'xl:grid-cols-6',
        };

        return [
            baseClasses,
            colMap[columns.default || 1] || 'grid-cols-1',
            smMap[columns.sm || 2] || 'sm:grid-cols-2',
            mdMap[columns.md || 3] || 'md:grid-cols-3',
            lgMap[columns.lg || 4] || 'lg:grid-cols-4',
            xlMap[columns.xl || 4] || 'xl:grid-cols-4',
        ].join(' ');
    };

    // Animation variants for the container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    // Animation variants for individual items
    const itemVariants = {
        hidden: { 
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: { 
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        }
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <>
            {[...Array(8)].map((_, index) => (
                <div 
                    key={`skeleton-${index}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden
                             border border-slate-200 dark:border-slate-700
                             animate-pulse"
                >
                    {/* Image skeleton */}
                    <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
                    
                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    // Empty state component
    const EmptyState = () => (
        <motion.div 
            className="flex flex-col items-center justify-center py-16 px-4
                     bg-white dark:bg-slate-800 rounded-2xl
                     border border-slate-200 dark:border-slate-700
                     text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <span className="text-6xl mb-4">{emptyIcon}</span>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {emptyMessage}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Try adjusting your search or filter to find what you're looking for.
            </p>
            
            {/* Quick suggestions */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700
                                 text-slate-700 dark:text-slate-300
                                 rounded-full text-sm hover:bg-slate-200 
                                 dark:hover:bg-slate-600 transition-colors">
                    Clear filters
                </button>
                <button className="px-4 py-2 bg-green-500 text-white
                                 rounded-full text-sm hover:bg-green-600 
                                 transition-colors">
                    Browse popular items
                </button>
            </div>
        </motion.div>
    );

    // If no foods and not loading, show empty state
    if (!foods.length && !loading) {
        return <EmptyState />;
    }

    return (
        <div className="w-full">
            {/* Results count (optional) */}
            {foods.length > 0 && (
                <div className="flex items-center justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>
                        Showing <span className="font-medium text-slate-700 dark:text-slate-300">
                            {foods.length}
                        </span> items
                    </span>
                    
                    {/* View toggle (optional) */}
                    {variant === 'grid' && (
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-green-500 text-white rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 
                                            dark:border-slate-700 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Main grid/list */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={variant + foods.length}
                    className={variant === 'grid' ? getGridClasses() : 'space-y-4'}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {foods.map((food, index) => (
                        <motion.div
                            key={food._id || index}
                            variants={itemVariants}
                            custom={index}
                            whileHover={{ scale: variant === 'grid' ? 1.02 : 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onFoodClick?.(food)}
                        >
                            <FoodCard 
                                food={food} 
                                variant={variant}
                            />
                        </motion.div>
                    ))}

                    {/* Loading skeletons */}
                    {loading && <LoadingSkeleton />}
                </motion.div>
            </AnimatePresence>

            {/* Load more section */}
            {(hasMore || loading) && (
                <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-green-500/30 
                                          border-t-green-500 rounded-full animate-spin" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Loading more items...
                            </span>
                        </div>
                    ) : (
                        showLoadMore && onLoadMore && (
                            <button
                                onClick={onLoadMore}
                                className="px-6 py-3 bg-white dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-xl text-slate-700 dark:text-slate-300
                                         hover:border-green-500 hover:text-green-500
                                         transition-all duration-200
                                         flex items-center gap-2"
                            >
                                <span>Load more</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )
                    )}
                </div>
            )}

            {/* End of list message */}
            {!hasMore && foods.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-sm text-slate-400">
                        You've reached the end! 🎉
                    </p>
                </div>
            )}
        </div>
    );
};

export default FoodList;
