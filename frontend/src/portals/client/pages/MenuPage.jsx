import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import foodService from '../services/food.service';
import FoodFilter from '../components/food/FoodFilter';
import FoodList from '../components/food/FoodList';
import { useSearchParams, useLocation } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { toast } from 'react-hot-toast';

const MenuPage = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Use URL params for better sharing and browser navigation
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const { addItem } = useCart();
    const handledReorderRef = useRef(false);
    
    // Initialize state from URL params
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
    const [dietaryFilter, setDietaryFilter] = useState(searchParams.get('dietary') || 'all');
    const [priceRange, setPriceRange] = useState(() => {
        const min = searchParams.get('minPrice');
        const max = searchParams.get('maxPrice');
        return {
            min: min ? parseInt(min) : 0,
            max: max ? parseInt(max) : 1000
        };
    });

    // Synchronize state with URL search parameters
    useEffect(() => {
        const q = searchParams.get('q') || '';
        const cat = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'popular';
        const diet = searchParams.get('dietary') || 'all';
        setKeyword(q);
        setCategory(cat);
        setSortBy(sort);
        setDietaryFilter(diet);
    }, [searchParams]);

    // Handle reordering items passed in location.state from Orders page
    useEffect(() => {
        const reorderItems = location.state?.reorderItems;
        if (!reorderItems || !Array.isArray(reorderItems) || reorderItems.length === 0 || handledReorderRef.current) {
            return;
        }
        handledReorderRef.current = true;

        const addItems = async () => {
            let addedCount = 0;
            for (const item of reorderItems) {
                const foodId = item.foodId?._id || item.foodId?.id || item.foodId || item.food?._id || item.food?.id;
                if (foodId) {
                    try {
                        await addItem(foodId, item.quantity || 1);
                        addedCount += 1;
                    } catch (e) {
                        console.error('Failed to reorder item:', item.name, e);
                    }
                }
            }
            if (addedCount > 0) {
                toast.success(`Added ${addedCount} items to your cart!`);
            }
        };

        addItems();
    }, [location.state, addItem]);

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
            const price = Number(food?.price) || 0;
            const matchesPrice = price >= priceRange.min && price <= priceRange.max;
            if (!matchesPrice) return false;

            if (category && category !== 'All' && category.trim() !== '') {
                const foodCategory = (food?.category || '').toLowerCase();
                const selectedCategory = category.toLowerCase().trim();
                if (foodCategory !== selectedCategory) return false;
            }

            if (keyword && keyword.trim() !== '') {
                const term = keyword.toLowerCase().trim();
                const name = (food?.name || '').toLowerCase();
                const description = (food?.description || '').toLowerCase();
                const foodCategory = (food?.category || '').toLowerCase();
                const ingredients = Array.isArray(food?.ingredients)
                    ? food.ingredients.join(' ').toLowerCase()
                    : '';
                const matchesKeyword =
                    name.includes(term) ||
                    description.includes(term) ||
                    foodCategory.includes(term) ||
                    ingredients.includes(term);
                if (!matchesKeyword) return false;
            }

            // Dietary filtering
            if (dietaryFilter && dietaryFilter !== 'all') {
                const name = (food?.name || '').toLowerCase();
                const desc = (food?.description || '').toLowerCase();
                const cat = (food?.category || '').toLowerCase();
                const ing = Array.isArray(food?.ingredients) ? food.ingredients.join(' ').toLowerCase() : '';
                const combined = `${name} ${desc} ${cat} ${ing}`;

                switch (dietaryFilter) {
                    case 'vegetarian':
                        if (!food.isVegetarian && !combined.includes('vegetarian') && !combined.includes('veggie')) {
                            return false;
                        }
                        break;
                    case 'vegan':
                        if (!combined.includes('vegan') && !food.isVegetarian) {
                            return false;
                        }
                        break;
                    case 'halal':
                        if (!combined.includes('halal') && !food.isVegetarian && !combined.includes('chicken') && !combined.includes('lamb')) {
                            return false;
                        }
                        break;
                    case 'gluten-free':
                        if (combined.includes('flour') || combined.includes('wheat') || combined.includes('gluten') || combined.includes('pasta') || combined.includes('bread')) {
                            return false;
                        }
                        break;
                    case 'spicy':
                        if (!combined.includes('spicy') && !combined.includes('chili') && !combined.includes('pepper') && !combined.includes('curry') && !combined.includes('hot')) {
                            return false;
                        }
                        break;
                    case 'popular':
                        if (!food.isPopular && (food.rating || 0) < 4.5) {
                            return false;
                        }
                        break;
                    default:
                        break;
                }
            }

            return true;
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
    }, [foods, sortBy, priceRange, category, keyword, dietaryFilter]);

    // Handle filter changes with URL sync
    const handleKeywordChange = (value) => {
        setKeyword(value);
        updateSearchParams({ q: value });
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        updateSearchParams({ category: value });
    };

    const handleDietaryFilterChange = (value) => {
        setDietaryFilter(value);
        updateSearchParams({ dietary: value === 'all' ? '' : value });
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
        setDietaryFilter('all');
        setPriceRange({ min: 0, max: maxAvailablePrice });
        setSearchParams({});
    };

    // Get active filter count
    const activeFilterCount = [
        keyword, 
        category && category !== 'All', 
        sortBy !== 'popular',
        dietaryFilter && dietaryFilter !== 'all',
        priceRange.min > 0 || priceRange.max < maxAvailablePrice
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
                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 
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
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-50/60 via-orange-50/40 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Our Menu
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                {filteredFoods.length} delicious items available
                                {category && ` in ${category}`}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-white/70 px-3 py-1 text-xs text-[var(--primary)] dark:border-[var(--primary)]/30 dark:bg-slate-800/70 dark:text-[var(--primary)]">
                                <span>Live Menu</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
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
                                    className="text-sm text-[var(--primary)] hover:opacity-80 font-medium
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
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
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
                        dietaryFilter={dietaryFilter}
                        onDietaryFilterChange={handleDietaryFilterChange}
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
                                          border-t-[var(--primary)] rounded-full animate-spin" />
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
                                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl 
                                                 hover:opacity-90 transition-opacity font-medium"
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
