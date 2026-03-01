import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch,
    FiX,
    FiFilter,
    FiClock,
    FiTrendingUp,
    FiStar,
    FiMapPin,
    FiCalendar,
    FiChevronDown,
    FiChevronUp,
    FiMic,
    FiCamera,
    FiLoader,
    FiHash
} from 'react-icons/fi';

interface SearchSuggestion {
    id: string;
    text: string;
    category?: string;
    icon?: React.ReactNode;
    metadata?: Record<string, any>;
}

interface FilterOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
    options?: Array<{ value: string; label: string }>;
}

interface SearchBarProps {
    onSearch: (query: string, filters?: Record<string, any>) => void;
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    onFilterChange?: (filters: Record<string, any>) => void;
    placeholder?: string;
    initialValue?: string;
    suggestions?: SearchSuggestion[];
    recentSearches?: string[];
    trendingSearches?: string[];
    popularCategories?: Array<{ id: string; name: string; icon?: string }>;
    filters?: FilterOption[];
    showFilters?: boolean;
    showVoiceSearch?: boolean;
    showImageSearch?: boolean;
    autoFocus?: boolean;
    debounceMs?: number;
    isLoading?: boolean;
    variant?: 'default' | 'hero' | 'compact' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
    theme?: 'light' | 'dark' | 'auto';
    className?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    onSuggestionClick,
    onFilterChange,
    placeholder = 'Search...',
    initialValue = '',
    suggestions = [],
    recentSearches = [],
    trendingSearches = [],
    popularCategories = [],
    filters = [],
    showFilters = true,
    showVoiceSearch = false,
    showImageSearch = false,
    autoFocus = false,
    debounceMs = 300,
    isLoading = false,
    variant = 'default',
    size = 'md',
    theme = 'auto',
    className = '',
    onFocus,
    onBlur,
    onClear
}) => {
    const [query, setQuery] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
    const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearchesList(JSON.parse(saved));
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (query.length >= 2) {
            debounceTimerRef.current = setTimeout(() => {
                onSearch(query, selectedFilters);
            }, debounceMs);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query, selectedFilters, debounceMs, onSearch]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current && !inputRef.current.contains(event.target as Node) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                filterRef.current && !filterRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
                setShowSuggestions(false);
                setShowFilterPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const suggestionsList = getAllSuggestions();

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveSuggestionIndex(prev => 
                    prev < suggestionsList.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
                break;
            case 'Enter':
                if (activeSuggestionIndex >= 0) {
                    e.preventDefault();
                    handleSuggestionClick(suggestionsList[activeSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setShowFilterPanel(false);
                inputRef.current?.blur();
                break;
            case 'Tab':
                setShowSuggestions(false);
                break;
        }
    };

    // Scroll active suggestion into view
    useEffect(() => {
        if (activeSuggestionIndex >= 0 && suggestionsRef.current) {
            const activeElement = suggestionsRef.current.children[activeSuggestionIndex] as HTMLElement;
            activeElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeSuggestionIndex]);

    // Handle search submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Save to recent searches
            const updatedRecent = [query, ...recentSearchesList.filter(s => s !== query)].slice(0, 5);
            setRecentSearchesList(updatedRecent);
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

            onSearch(query, selectedFilters);
            setShowSuggestions(false);
            setIsFocused(false);
        }
    };

    // Handle clear
    const handleClear = () => {
        setQuery('');
        setActiveSuggestionIndex(-1);
        onClear?.();
        inputRef.current?.focus();
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: SearchSuggestion | string) => {
        const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
        setQuery(suggestionText);
        onSearch(suggestionText, selectedFilters);
        onSuggestionClick?.(typeof suggestion === 'string' ? { id: suggestionText, text: suggestionText } : suggestion);
        setShowSuggestions(false);
        setIsFocused(false);
    };

    // Handle filter change
    const handleFilterChange = (filterId: string, value: any) => {
        const newFilters = { ...selectedFilters, [filterId]: value };
        setSelectedFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // Handle voice search
    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsVoiceSearchActive(true);
            // Implement voice search logic here
            setTimeout(() => setIsVoiceSearchActive(false), 2000);
        } else {
            alert('Voice search is not supported in your browser');
        }
    };

    // Get all suggestions (combined from props)
    const getAllSuggestions = (): (SearchSuggestion | string)[] => {
        const all: (SearchSuggestion | string)[] = [];

        if (recentSearchesList.length > 0 && query.length === 0) {
            all.push(...recentSearchesList);
        }

        if (trendingSearches.length > 0 && query.length === 0) {
            all.push(...trendingSearches);
        }

        if (suggestions.length > 0) {
            all.push(...suggestions);
        }

        return all;
    };

    // Size classes
    const sizeClasses = {
        sm: {
            container: 'h-10',
            input: 'text-sm pl-10 pr-20',
            icon: 'w-4 h-4',
            button: 'px-3 py-1.5 text-sm'
        },
        md: {
            container: 'h-12',
            input: 'text-base pl-12 pr-24',
            icon: 'w-5 h-5',
            button: 'px-4 py-2 text-base'
        },
        lg: {
            container: 'h-14',
            input: 'text-lg pl-14 pr-28',
            icon: 'w-6 h-6',
            button: 'px-5 py-2.5 text-lg'
        }
    };

    // Variant classes
    const variantClasses = {
        default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        hero: 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-2 border-orange-500/20 shadow-xl',
        compact: 'bg-slate-100 dark:bg-slate-800 border border-transparent',
        minimal: 'bg-transparent border-b border-slate-200 dark:border-slate-700 rounded-none'
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Form */}
            <form
                onSubmit={handleSubmit}
                className={`
                    relative flex items-center rounded-xl
                    transition-all duration-200
                    ${sizeClasses[size].container}
                    ${variantClasses[variant]}
                    ${isFocused ? 'ring-2 ring-orange-500/20 border-orange-500' : ''}
                `}
            >
                {/* Search Icon */}
                <div className="absolute left-3 text-slate-400">
                    {isLoading ? (
                        <FiLoader className={`${sizeClasses[size].icon} animate-spin`} />
                    ) : (
                        <FiSearch className={sizeClasses[size].icon} />
                    )}
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        setActiveSuggestionIndex(-1);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                        onFocus?.();
                    }}
                    onBlur={() => {
                        onBlur?.();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`
                        w-full h-full bg-transparent
                        ${sizeClasses[size].input}
                        text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        outline-none
                    `}
                />

                {/* Right Side Actions */}
                <div className="absolute right-2 flex items-center gap-1">
                    {/* Filter Button */}
                    {showFilters && filters.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`
                                p-1.5 rounded-lg transition-colors
                                ${Object.keys(selectedFilters).length > 0
                                    ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            <FiFilter className={sizeClasses[size].icon} />
                        </button>
                    )}

                    {/* Voice Search */}
                    {showVoiceSearch && (
                        <button
                            type="button"
                            onClick={handleVoiceSearch}
                            className={`
                                p-1.5 rounded-lg transition-colors
                                ${isVoiceSearchActive
                                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse'
                                    : 'text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            <FiMic className={sizeClasses[size].icon} />
                        </button>
                    )}

                    {/* Image Search */}
                    {showImageSearch && (
                        <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-colors"
                        >
                            <FiCamera className={sizeClasses[size].icon} />
                        </button>
                    )}

                    {/* Clear Button */}
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 text-slate-400 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-colors"
                        >
                            <FiX className={sizeClasses[size].icon} />
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-lg transition-colors
                                 text-sm font-medium"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {isFocused && showSuggestions && getAllSuggestions().length > 0 && (
                    <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800
                                 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                 max-h-96 overflow-y-auto"
                    >
                        {/* Recent Searches */}
                        {recentSearchesList.length > 0 && query.length === 0 && (
                            <div className="p-2">
                                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                                    Recent Searches
                                </div>
                                {recentSearchesList.map((search, index) => (
                                    <motion.button
                                        key={`recent-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => handleSuggestionClick(search)}
                                        className={`
                                            w-full px-3 py-2 text-left rounded-lg
                                            flex items-center gap-3
                                            transition-colors duration-150
                                            ${activeSuggestionIndex === index
                                                ? 'bg-orange-50 dark:bg-orange-900/20'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <FiClock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {search}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Trending Searches */}
                        {trendingSearches.length > 0 && query.length === 0 && (
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                                    Trending Now
                                </div>
                                <div className="flex flex-wrap gap-2 px-3">
                                    {trendingSearches.map((search, index) => (
                                        <button
                                            key={`trending-${index}`}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30
                                                     text-orange-700 dark:text-orange-300
                                                     rounded-full text-sm
                                                     hover:bg-orange-100 dark:hover:bg-orange-900/50
                                                     transition-colors"
                                        >
                                            <FiTrendingUp className="inline w-3 h-3 mr-1" />
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Categories */}
                        {popularCategories.length > 0 && query.length === 0 && (
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                                    Popular Categories
                                </div>
                                <div className="grid grid-cols-2 gap-2 px-3">
                                    {popularCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleSuggestionClick(category.name)}
                                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900
                                                     rounded-lg text-sm text-slate-700 dark:text-slate-300
                                                     hover:bg-orange-50 dark:hover:bg-orange-900/20
                                                     transition-colors flex items-center gap-2"
                                        >
                                            <span className="text-lg">{category.icon}</span>
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="p-2">
                                {suggestions.map((suggestion, index) => {
                                    const globalIndex = recentSearchesList.length + index;
                                    return (
                                        <motion.button
                                            key={suggestion.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className={`
                                                w-full px-3 py-2 text-left rounded-lg
                                                flex items-center gap-3
                                                transition-colors duration-150
                                                ${activeSuggestionIndex === globalIndex
                                                    ? 'bg-orange-50 dark:bg-orange-900/20'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }
                                            `}
                                        >
                                            {suggestion.icon || (
                                                <FiSearch className="w-4 h-4 text-slate-400" />
                                            )}
                                            <div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                                    {suggestion.text}
                                                </span>
                                                {suggestion.category && (
                                                    <span className="ml-2 text-xs text-slate-400">
                                                        in {suggestion.category}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilterPanel && filters.length > 0 && (
                    <motion.div
                        ref={filterRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 right-0 mt-2 w-80 bg-white dark:bg-slate-800
                                 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                 p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Filters
                            </h3>
                            <button
                                onClick={() => {
                                    setSelectedFilters({});
                                    onFilterChange?.({});
                                }}
                                className="text-sm text-orange-500 hover:text-orange-600"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="space-y-4">
                            {filters.map((filter) => (
                                <div key={filter.id}>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        <div className="flex items-center gap-2">
                                            {filter.icon}
                                            {filter.label}
                                        </div>
                                    </label>
                                    
                                    {filter.options ? (
                                        <select
                                            value={selectedFilters[filter.id] || ''}
                                            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900
                                                     border border-slate-200 dark:border-slate-700
                                                     rounded-lg text-sm
                                                     focus:outline-none focus:border-orange-500"
                                        >
                                            <option value="">All</option>
                                            {filter.options.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={selectedFilters[filter.id] || ''}
                                            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                            placeholder={`Enter ${filter.label.toLowerCase()}...`}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900
                                                     border border-slate-200 dark:border-slate-700
                                                     rounded-lg text-sm
                                                     focus:outline-none focus:border-orange-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setShowFilterPanel(false)}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white
                                         rounded-lg hover:bg-orange-600
                                         transition-colors text-sm font-medium"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={() => setShowFilterPanel(false)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700
                                         rounded-lg text-sm hover:bg-slate-50
                                         dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filters Display */}
            {Object.keys(selectedFilters).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(selectedFilters).map(([key, value]) => {
                        if (!value) return null;
                        const filter = filters.find(f => f.id === key);
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1 px-3 py-1
                                         bg-orange-50 dark:bg-orange-900/30
                                         text-orange-700 dark:text-orange-300
                                         rounded-full text-sm"
                            >
                                {filter?.icon}
                                <span>{filter?.label}: {value}</span>
                                <button
                                    onClick={() => handleFilterChange(key, '')}
                                    className="ml-1 hover:text-orange-900 dark:hover:text-orange-400"
                                >
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SearchBar;