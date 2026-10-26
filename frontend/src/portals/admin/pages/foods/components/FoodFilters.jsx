import React from 'react';
import { motion } from 'framer-motion';

const FoodFilters = ({
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedCuisine,
    setSelectedCuisine,
    cuisines,
    selectedStatus,
    setSelectedStatus,
    priceRange,
    setPriceRange,
    dietaryOptions,
    selectedDietary,
    setSelectedDietary,
    handleClearFilters
}) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
        >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cuisine Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Cuisine
                        </label>
                        <select
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            <option value="All">All Cuisines</option>
                            {cuisines.map((cuisine) => (
                                <option key={cuisine} value={cuisine}>{cuisine}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            <option value="All">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Price Range
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-lg text-sm"
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-lg text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </div>

                {/* Dietary Filters */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                        Dietary Options
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    setSelectedDietary((prev) => 
                                        prev.includes(option.id)
                                            ? prev.filter((id) => id !== option.id)
                                            : [...prev, option.id]
                                    );
                                }}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-medium
                                    transition-colors duration-200
                                    ${selectedDietary.includes(option.id)
                                        ? `bg-${option.color}-100 text-${option.color}-700 dark:bg-${option.color}-900/30 dark:text-${option.color}-400`
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory !== "All" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                Category: {selectedCategory}
                                <button onClick={() => setSelectedCategory("All")}>×</button>
                            </span>
                        )}
                        {selectedCuisine !== "All" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                Cuisine: {selectedCuisine}
                                <button onClick={() => setSelectedCuisine("All")}>×</button>
                            </span>
                        )}
                        {selectedStatus !== "All" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                Status: {selectedStatus}
                                <button onClick={() => setSelectedStatus("All")}>×</button>
                            </span>
                        )}
                        {selectedDietary.map((diet) => (
                            <span key={diet} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                {diet}
                                <button onClick={() => setSelectedDietary((prev) => prev.filter((d) => d !== diet))}>×</button>
                            </span>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-primary-600 hover:text-primary-700"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default FoodFilters;
