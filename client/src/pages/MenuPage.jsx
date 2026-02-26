import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import foodService from '../services/food.service';
import FoodFilter from '../components/food/FoodFilter';
import FoodList from '../components/food/FoodList';
import { useSearchParams } from 'react-router-dom';

const MenuPage = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Use URL params for better sharing and browser navigation
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize state from URL params
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
    const [priceRange, setPriceRange] = useState(() => {
        const min = searchParams.get('minPrice');
        const max = searchParams.get('maxPrice');
        return {
            min: min ? parseInt(min) : 0,
            max: max ? parseInt(max) : 1000
        };
    });

    const parseCollection = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.items)) return payload.items;
        return [];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [foodsResponse, categoriesResponse] = await Promise.all([
                    foodService.getFoods(),
                    foodService.getCategories()
                ]);

                setFoods(parseCollection(foodsResponse));
                setCategories(parseCollection(categoriesResponse));
            } catch (err) {
                setError('Failed to load menu. Please try again.');
                console.error('Menu page error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const maxAvailablePrice = useMemo(() => {
        if (!foods.length) return 1000;
        const maxPrice = foods.reduce((max, food) => Math.max(max, Number(food?.price) || 0), 0);
        return Math.max(50, Math.ceil(maxPrice));
    }, [foods]);

    useEffect(() => {
        const hasMinParam = searchParams.has('minPrice');
        const hasMaxParam = searchParams.has('maxPrice');
        if (!hasMinParam && !hasMaxParam && foods.length > 0) {
            setPriceRange({ min: 0, max: maxAvailablePrice });
        }
    }, [foods, maxAvailablePrice, searchParams]);

    // Update URL when filters change
    const updateSearchParams = (updates) => {
        const newParams = new URLSearchParams(searchParams);
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== '') {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        
        setSearchParams(newParams);
    };

    // Filter and sort foods
    const filteredFoods = useMemo(() => {
        let result = foods.filter((food) => {
            // Keyword search
            const keywordMatch = keyword
                ? `${food?.name || ''} ${food?.description || ''} ${food?.category || ''} ${food?.tags?.join(' ') || ''}`
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
                : true;

            // Category filter
            const categoryMatch = category
                ? String(food?.category || '').toLowerCase() === String(category).toLowerCase()
                : true;

            // Price range filter
            const price = Number(food?.price) || 0;
            const priceMatch = price >= priceRange.min && price <= priceRange.max;

            return keywordMatch && categoryMatch && priceMatch;
        });

        // Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'popular':
            default:
                result.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
                break;
        }

        return result;
    }, [foods, keyword, category, sortBy, priceRange]);

    // Handle filter changes with URL sync
    const handleKeywordChange = (value) => {
        setKeyword(value);
        updateSearchParams({ q: value });
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        updateSearchParams({ category: value });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        updateSearchParams({ sort: value });
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        updateSearchParams({ 
            minPrice: range.min.toString(),
            maxPrice: range.max.toString()
        });
    };

    const handleClearFilters = () => {
        setKeyword('');
        setCategory('');
        setSortBy('popular');
        setPriceRange({ min: 0, max: 50 });
        setSearchParams({});
    };

    // Get active filter count
    const activeFilterCount = [
        keyword, 
        category, 
        sortBy !== 'popular',
        priceRange.min > 0 || priceRange.max < 50
    ].filter(Boolean).length;

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 
                                 transition-colors font-medium"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header - Simple and clean */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Our Menu
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                {filteredFoods.length} delicious items available
                                {category && ` in ${category}`}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-3 py-1 text-xs text-orange-700 dark:border-orange-900/50 dark:bg-slate-800/70 dark:text-orange-300">
                                <span>Live Menu</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                <span>Freshly updated</span>
                            </div>
                        </div>
                        
                        {/* Active filters summary */}
                        {activeFilterCount > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                                </span>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-orange-500 hover:text-orange-600 font-medium
                                             flex items-center gap-1 transition-colors"
                                >
                                    Clear all
                                    <span>×</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter bar - Sticky for easy access */}
                <div className="sticky top-[70px] z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur pt-4 pb-6 -mt-4 border-b border-slate-100 dark:border-slate-800">
                    <FoodFilter
                        keyword={keyword}
                        onKeywordChange={handleKeywordChange}
                        category={category}
                        categories={categories}
                        onCategoryChange={handleCategoryChange}
                        sortBy={sortBy}
                        onSortChange={handleSortChange}
                        priceRange={priceRange}
                        onPriceRangeChange={handlePriceRangeChange}
                        minPrice={0}
                        maxPrice={maxAvailablePrice}
                    />
                </div>

                {/* Results section */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 
                                          border-t-orange-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                🍽️
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Results count (mobile) */}
                        <div className="md:hidden mb-4 text-sm text-slate-500 dark:text-slate-400">
                            Showing {filteredFoods.length} items
                        </div>

                        {/* Food grid */}
                        <AnimatePresence mode="wait">
                            {filteredFoods.length > 0 ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FoodList
                                        foods={filteredFoods}
                                        columns={{ default: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-16"
                                >
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        No items found
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                        We couldn't find any items matching your filters. Try adjusting your search or clear some filters.
                                    </p>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-xl 
                                                 hover:bg-orange-600 transition-colors font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
};

export default MenuPage;
