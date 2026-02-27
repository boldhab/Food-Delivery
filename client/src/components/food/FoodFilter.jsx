import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FoodFilter = ({
    keyword,
    onKeywordChange,
    category,
    categories,
    onCategoryChange,
    sortBy,
    onSortChange,
    priceRange,
    onPriceRangeChange,
    minPrice = 0,
    maxPrice = 1000,
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
    const [localMinPrice, setLocalMinPrice] = useState(String(priceRange.min ?? minPrice));
    const [localMaxPrice, setLocalMaxPrice] = useState(String(priceRange.max ?? maxPrice));
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const filterRef = useRef(null);
    const searchRef = useRef(null);
    const priceFilterRef = useRef(null);

    // Sort options
    const sortOptions = [
        { value: 'popular', label: 'Most Popular', icon: '🔥' },
        { value: 'rating', label: 'Highest Rated', icon: '⭐' },
        { value: 'price-low', label: 'Price: Low to High', icon: '💰' },
        { value: 'price-high', label: 'Price: High to Low', icon: '💎' },
    ];

    useEffect(() => {
        setLocalMinPrice(String(priceRange.min ?? minPrice));
        setLocalMaxPrice(String(priceRange.max ?? maxPrice));
    }, [priceRange.min, priceRange.max, minPrice, maxPrice]);

    // Mock search suggestions (in real app, these would come from API)
    useEffect(() => {
        if (keyword.length > 1) {
            // Simulate API call for suggestions
            const mockSuggestions = [
                `${keyword} pizza`,
                `${keyword} burger`,
                `${keyword} with cheese`,
                `spicy ${keyword}`,
                `vegetarian ${keyword}`,
            ].filter(s => s.includes(keyword));
            setSearchSuggestions(mockSuggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [keyword]);

    // Close filters on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
            if (priceFilterRef.current && !priceFilterRef.current.contains(event.target)) {
                setIsPriceFilterOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Apply price filter
    const applyPriceFilter = () => {
        const min = Number.isNaN(parseInt(localMinPrice)) ? minPrice : parseInt(localMinPrice);
        const max = Number.isNaN(parseInt(localMaxPrice)) ? maxPrice : parseInt(localMaxPrice);
        onPriceRangeChange({ min, max });
        setIsPriceFilterOpen(false);
    };

    // Reset price filter
    const resetPriceFilter = () => {
        setLocalMinPrice(String(minPrice));
        setLocalMaxPrice(String(maxPrice));
        onPriceRangeChange({ min: minPrice, max: maxPrice });
        setIsPriceFilterOpen(false);
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (category) count++;
        if (sortBy !== 'popular') count++;
        if (priceRange.min > minPrice || priceRange.max < maxPrice) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className="space-y-4">
            {/* Main filter bar */}
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Search with suggestions - Expanded on mobile, fixed on desktop */}
                <div className="flex-1 relative" ref={searchRef}>
                    <div className="relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            onFocus={() => keyword.length > 1 && setShowSuggestions(true)}
                            placeholder="Search by name, category, or description..."
                            className="w-full h-12 pl-11 pr-4
                                     bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl
                                     text-slate-900 dark:text-white
                                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                                     focus:outline-none focus:border-green-500
                                     focus:ring-2 focus:ring-green-500/20
                                     transition-all duration-200
                                     shadow-sm"
                        />
                        <svg 
                            className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Clear search button */}
                        {keyword && (
                            <button
                                onClick={() => onKeywordChange('')}
                                className="absolute right-3 top-3.5 text-slate-400 
                                         hover:text-slate-600 dark:hover:text-slate-300
                                         transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search suggestions dropdown */}
                    <AnimatePresence>
                        {showSuggestions && searchSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 
                                         rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                         overflow-hidden"
                            >
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            onKeywordChange(suggestion);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full px-4 py-3 text-left
                                                 hover:bg-slate-50 dark:hover:bg-slate-700
                                                 flex items-center gap-3
                                                 transition-colors duration-150
                                                 border-b last:border-b-0 border-slate-100 dark:border-slate-700"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">
                                            {suggestion}
                                        </span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile filter toggle */}
                <div className="lg:hidden flex gap-2">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex-1 h-12 px-4 bg-white dark:bg-slate-800 
                                 border border-slate-200 dark:border-slate-700
                                 rounded-xl text-slate-700 dark:text-slate-300
                                 flex items-center justify-center gap-2
                                 hover:border-green-500 transition-colors
                                 relative"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 
                                           bg-green-500 text-white text-xs
                                           rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Desktop filters */}
                <div className="hidden lg:flex items-center gap-3">
                    {/* Category select */}
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="h-12 px-4 pr-10 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     focus:outline-none focus:border-green-500
                                     focus:ring-2 focus:ring-green-500/20
                                     transition-all duration-200
                                     cursor-pointer min-w-[160px]
                                     appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-4 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    

                    {/* Price filter button */}
                    <div className="relative" ref={priceFilterRef}>
                        <button
                            onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                            className="h-12 px-4 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     hover:border-green-500 transition-colors
                                     flex items-center gap-2
                                     relative"
                        >
                            <span>Price</span>
                            {(priceRange.min > minPrice || priceRange.max < maxPrice) && (
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Price filter dropdown */}
                        <AnimatePresence>
                            {isPriceFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 z-50 mt-2 w-80 
                                             bg-white dark:bg-slate-800 
                                             rounded-xl shadow-xl 
                                             border border-slate-200 dark:border-slate-700
                                             p-4"
                                >
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                        Price Range
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">
                                                Min ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={localMinPrice}
                                                onChange={(e) => setLocalMinPrice(e.target.value)}
                                                min={minPrice}
                                                max={maxPrice}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900
                                                         border border-slate-200 dark:border-slate-700
                                                         rounded-lg text-slate-900 dark:text-white
                                                         focus:outline-none focus:border-green-500
                                                         focus:ring-2 focus:ring-green-500/20"
                                            />
                                        </div>
                                        <span className="text-slate-400 mt-6">—</span>
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">
                                                Max ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={localMaxPrice}
                                                onChange={(e) => setLocalMaxPrice(e.target.value)}
                                                min={minPrice}
                                                max={maxPrice}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900
                                                         border border-slate-200 dark:border-slate-700
                                                         rounded-lg text-slate-900 dark:text-white
                                                         focus:outline-none focus:border-green-500
                                                         focus:ring-2 focus:ring-green-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Preset ranges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {[
                                            { label: 'Budget', min: minPrice, max: Math.max(minPrice + 10, Math.round(maxPrice * 0.25)) },
                                            { label: 'Mid Range', min: Math.round(maxPrice * 0.25), max: Math.round(maxPrice * 0.5) },
                                            { label: 'Premium', min: Math.round(maxPrice * 0.5), max: Math.round(maxPrice * 0.75) },
                                            { label: 'Top Tier', min: Math.round(maxPrice * 0.75), max: maxPrice },
                                        ].map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => {
                                                    setLocalMinPrice(range.min.toString());
                                                    setLocalMaxPrice(range.max.toString());
                                                    onPriceRangeChange({ min: range.min, max: range.max });
                                                    setIsPriceFilterOpen(false);
                                                }}
                                                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700
                                                         text-slate-700 dark:text-slate-300
                                                         rounded-full hover:bg-slate-200 
                                                         dark:hover:bg-slate-600 transition-colors"
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={applyPriceFilter}
                                            className="flex-1 px-4 py-2 bg-green-500 text-white 
                                                     rounded-lg hover:bg-green-600 transition-colors
                                                     font-medium"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={resetPriceFilter}
                                            className="px-4 py-2 border border-slate-200 dark:border-slate-700
                                                     rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700
                                                     transition-colors text-slate-600 dark:text-slate-400"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile filter panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden overflow-hidden"
                        ref={filterRef}
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-xl 
                                      border border-slate-200 dark:border-slate-700
                                      p-4 space-y-4">
                            {/* Category filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-slate-900 dark:text-white
                                             focus:outline-none focus:border-green-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Sort by
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => onSortChange(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-slate-900 dark:text-white
                                             focus:outline-none focus:border-green-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price filter for mobile */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Price Range
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={localMinPrice}
                                        onChange={(e) => setLocalMinPrice(e.target.value)}
                                        placeholder="Min"
                                        className="flex-1 h-12 px-4 bg-slate-50 dark:bg-slate-900
                                                 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-slate-900 dark:text-white
                                                 focus:outline-none focus:border-green-500"
                                    />
                                    <span className="text-slate-400">—</span>
                                    <input
                                        type="number"
                                        value={localMaxPrice}
                                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                                        placeholder="Max"
                                        className="flex-1 h-12 px-4 bg-slate-50 dark:bg-slate-900
                                                 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-slate-900 dark:text-white
                                                 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <button
                                    onClick={applyPriceFilter}
                                    className="w-full mt-3 px-4 py-2 bg-green-500 text-white 
                                             rounded-lg hover:bg-green-600 transition-colors
                                             font-medium"
                                >
                                    Apply Price Filter
                                </button>
                            </div>

                            {/* Active filters */}
                            {activeFilterCount > 0 && (
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Active Filters
                                        </span>
                                        <button
                                            onClick={() => {
                                                onCategoryChange('');
                                                onSortChange('popular');
                                                resetPriceFilter();
                                            }}
                                            className="text-sm text-green-500 hover:text-green-600"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {category && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 
                                                           bg-green-100 dark:bg-green-900/30 
                                                           text-green-700 dark:text-green-300
                                                           rounded-full text-sm">
                                                {category}
                                                <button onClick={() => onCategoryChange('')}>×</button>
                                            </span>
                                        )}
                                        {(priceRange.min > minPrice || priceRange.max < maxPrice) && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 
                                                           bg-green-100 dark:bg-green-900/30 
                                                           text-green-700 dark:text-green-300
                                                           rounded-full text-sm">
                                                ${priceRange.min} - ${priceRange.max}
                                                <button onClick={resetPriceFilter}>×</button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop active filter chips */}
            <div className="hidden lg:flex flex-wrap gap-2">
                {category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 
                                   bg-green-100 dark:bg-green-900/30 
                                   text-green-700 dark:text-green-300
                                   rounded-full text-sm">
                        {category}
                        <button 
                            onClick={() => onCategoryChange('')}
                            className="hover:text-green-900 dark:hover:text-green-400"
                        >
                            ×
                        </button>
                    </span>
                )}
                {(priceRange.min > minPrice || priceRange.max < maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 
                                   bg-green-100 dark:bg-green-900/30 
                                   text-green-700 dark:text-green-300
                                   rounded-full text-sm">
                        ${priceRange.min} - ${priceRange.max}
                        <button 
                            onClick={resetPriceFilter}
                            className="hover:text-green-900 dark:hover:text-green-400"
                        >
                            ×
                        </button>
                    </span>
                )}
                {sortBy !== 'popular' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 
                                   bg-slate-100 dark:bg-slate-800
                                   text-slate-700 dark:text-slate-300
                                   rounded-full text-sm">
                        {sortOptions.find(o => o.value === sortBy)?.icon} {sortOptions.find(o => o.value === sortBy)?.label}
                        <button 
                            onClick={() => onSortChange('popular')}
                            className="hover:text-slate-900 dark:hover:text-slate-100"
                        >
                            ×
                        </button>
                    </span>
                )}
            </div>

            {/* Results count */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
                {activeFilterCount > 0 ? (
                    <span>{activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</span>
                ) : (
                    <span>Showing all items</span>
                )}
            </div>
        </div>
    );
};

export default FoodFilter;
