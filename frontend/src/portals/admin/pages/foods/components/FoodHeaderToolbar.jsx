import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, 
    FiSearch, 
    FiDownload, 
    FiGrid, 
    FiList, 
    FiSliders, 
    FiChevronDown, 
    FiChevronUp 
} from 'react-icons/fi';

const FoodHeaderToolbar = ({
    viewMode,
    setViewMode,
    showBulkActions,
    setShowBulkActions,
    handleExport,
    selectedCount = 0,
    handleOpenCreate,
    search,
    handleSearch,
    showFilters,
    setShowFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    children
}) => {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Food Items
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your menu items, pricing, and availability
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* View Toggle */}
                    <div className="flex items-center h-9 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-border">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                viewMode === "list" 
                                    ? "bg-card text-primary shadow-2xs font-bold" 
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="List view"
                        >
                            <FiList className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Rows</span>
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                viewMode === "grid" 
                                    ? "bg-card text-primary shadow-2xs font-bold" 
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title="Grid view"
                        >
                            <FiGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-9 px-3.5 bg-card border border-border rounded-xl text-foreground hover:border-primary/50 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
                        >
                            <FiDownload className="w-4 h-4 text-primary" />
                            <span>Export</span>
                            {selectedCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-primary text-white text-2xs font-extrabold">
                                    {selectedCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showBulkActions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-20"
                                >
                                    <div className="px-3.5 py-2 border-b border-border bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                                            {selectedCount > 0
                                                ? `Scope: ${selectedCount} Selected Items`
                                                : 'Scope: All Filtered Items'}
                                        </p>
                                    </div>
                                    {["csv", "excel", "pdf"].map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => {
                                                handleExport(format);
                                                setShowBulkActions(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FiDownload className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="font-semibold">{format.toUpperCase()}</span>
                                            </div>
                                            <span className="text-2xs text-muted-foreground">
                                                {selectedCount > 0 ? `(${selectedCount})` : 'All'}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleOpenCreate}
                        className="h-9 px-3.5 bg-primary hover:bg-primary-700 text-white rounded-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Food</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search food items by name, description, or tags..."
                            className="w-full h-9 pl-9 pr-4 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-9 px-3.5 rounded-xl border transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer ${
                            showFilters 
                                ? "bg-primary text-white border-primary shadow-xs" 
                                : "bg-card border-border text-foreground hover:border-primary/50 shadow-2xs"
                        }`}
                    >
                        <FiSliders className="w-4 h-4" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-white text-primary rounded-full text-xs font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-9 px-3 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="rating">Rating</option>
                            <option value="orderCount">Popularity</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="h-9 w-9 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors cursor-pointer shadow-2xs"
                        >
                            {sortOrder === "asc" ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Filter Panel (if expanded) */}
                {children}
            </div>
        </>
    );
};

export default FoodHeaderToolbar;
