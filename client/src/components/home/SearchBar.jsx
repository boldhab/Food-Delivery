import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiCamera } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';

const SearchBar = ({
    value: externalValue = '',
    onChange,
    onSearch,
    placeholder = 'Search for food or restaurants...',
    autoFocus = false,
    variant = 'default',
    showSuggestions = true,
    recentSearches = [],
    trendingSearches = [],
    onSuggestionClick,
    className = '',
    debounceMs = 300,
    isLoading = false,
}) => {
    const navigate = useNavigate();
    const [internalValue, setInternalValue] = useState(externalValue);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showClearButton, setShowClearButton] = useState(false);
    
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debouncedValue = useDebounce(internalValue, debounceMs);

    // Sync external value
    useEffect(() => {
        setInternalValue(externalValue);
    }, [externalValue]);

    // Handle debounced value change
    useEffect(() => {
        if (onChange) {
            onChange(debouncedValue);
        }
        
        // Fetch suggestions based on debounced value
        if (debouncedValue.length > 1) {
            fetchSuggestions(debouncedValue);
        } else {
            setSuggestions([]);
        }
    }, [debouncedValue, onChange]);

    // Mock suggestion fetching (replace with actual API call)
    const fetchSuggestions = async (query) => {
        // Simulate API call
        const mockSuggestions = [
            `${query} pizza`,
            `${query} burger`,
            `${query} with cheese`,
            `spicy ${query}`,
            `vegetarian ${query}`,
            `best ${query} near me`,
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
        
        setSuggestions(mockSuggestions);
    };

    // Handle input change
    const handleChange = (e) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        setShowClearButton(newValue.length > 0);
        setSelectedIndex(-1);
    };

    // Handle clear
    const handleClear = () => {
        setInternalValue('');
        setShowClearButton(false);
        setSuggestions([]);
        if (onChange) onChange('');
        inputRef.current?.focus();
    };

    // Handle search submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (internalValue.trim()) {
            if (onSearch) {
                onSearch(internalValue);
            } else {
                navigate(`/menu?q=${encodeURIComponent(internalValue)}`);
            }
            // Save to recent searches (implement your storage logic)
            saveToRecentSearches(internalValue);
            setIsFocused(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInternalValue(suggestion);
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        } else {
            navigate(`/menu?q=${encodeURIComponent(suggestion)}`);
        }
        saveToRecentSearches(suggestion);
        setIsFocused(false);
        setSuggestions([]);
    };

    // Save to recent searches (implement with localStorage or your state management)
    const saveToRecentSearches = (query) => {
        // Implement your recent searches logic here
        console.log('Saving search:', query);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < getSuggestionsList().length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    handleSuggestionClick(getSuggestionsList()[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsFocused(false);
                setSuggestions([]);
                break;
        }
    };

    // Get combined suggestions list
    const getSuggestionsList = () => {
        if (internalValue.length > 1) {
            return suggestions;
        }
        return [];
    };

    // Scroll selected suggestion into view
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionsRef.current) {
            const selectedElement = suggestionsRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                });
            }
        }
    }, [selectedIndex]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setIsFocused(false);
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Variant styles
    const variantStyles = {
        default: {
            container: 'w-full max-w-md',
            input: 'h-12 text-base',
            icon: 'w-5 h-5',
        },
        hero: {
            container: 'w-full max-w-2xl',
            input: 'h-14 text-lg',
            icon: 'w-6 h-6',
        },
        compact: {
            container: 'w-full max-w-sm',
            input: 'h-10 text-sm',
            icon: 'w-4 h-4',
        },
    };

    const currentVariant = variantStyles[variant];

    return (
        <div className={`relative ${currentVariant.container} ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    {/* Search Icon */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-orange-500/30 
                                          border-t-orange-500 rounded-full animate-spin" />
                        ) : (
                            <FiSearch className={`${currentVariant.icon}`} />
                        )}
                    </div>

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={internalValue}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        className={`
                            w-full rounded-xl border
                            bg-white dark:bg-slate-800
                            text-slate-900 dark:text-white
                            placeholder:text-slate-400 dark:placeholder:text-slate-500
                            outline-none transition-all duration-200
                            ${currentVariant.input}
                            pl-12 pr-12
                            ${isFocused 
                                ? 'border-orange-500 ring-2 ring-orange-500/20' 
                                : 'border-slate-200 dark:border-slate-700'
                            }
                        `}
                    />

                    {/* Clear Button */}
                    <AnimatePresence>
                        {showClearButton && (
                            <motion.button
                                type="button"
                                onClick={handleClear}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2
                                         text-slate-400 hover:text-slate-600
                                         dark:hover:text-slate-300
                                         transition-colors duration-200"
                                aria-label="Clear search"
                            >
                                <FiX className={`${currentVariant.icon}`} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {isFocused && showSuggestions && (
                    <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800
                                 rounded-xl shadow-xl border border-slate-200 
                                 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && internalValue.length === 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <FiClock className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500 uppercase">
                                        Recent Searches
                                    </span>
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(search)}
                                        className="w-full px-3 py-2 text-left
                                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                                 rounded-lg transition-colors duration-150
                                                 flex items-center gap-3"
                                    >
                                        <FiClock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {search}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trending Searches */}
                        {trendingSearches.length > 0 && internalValue.length === 0 && (
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <FiTrendingUp className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-medium text-slate-500 uppercase">
                                        Trending Now
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 px-3">
                                    {trendingSearches.map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30
                                                     text-orange-700 dark:text-orange-300
                                                     rounded-full text-sm
                                                     hover:bg-orange-100 dark:hover:bg-orange-900/50
                                                     transition-colors duration-150"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Suggestions */}
                        {getSuggestionsList().length > 0 && (
                            <div className="p-2">
                                {getSuggestionsList().map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={`
                                            w-full px-3 py-2 text-left
                                            rounded-lg transition-colors duration-150
                                            flex items-center gap-3
                                            ${selectedIndex === index
                                                ? 'bg-orange-50 dark:bg-orange-900/30'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <FiSearch className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {suggestion}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Image Search Option (Optional) */}
                        {variant === 'hero' && (
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    className="w-full px-3 py-3 text-left
                                             hover:bg-slate-100 dark:hover:bg-slate-700
                                             rounded-lg transition-colors duration-150
                                             flex items-center gap-3 text-slate-600 
                                             dark:text-slate-400"
                                >
                                    <FiCamera className="w-5 h-5" />
                                    <div>
                                        <div className="text-sm font-medium">Search by image</div>
                                        <div className="text-xs">Upload a photo to find similar dishes</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Stats (Optional) */}
            {internalValue.length > 0 && !isFocused && (
                <div className="absolute -bottom-6 left-4 text-xs text-slate-400">
                    Press Enter to search
                </div>
            )}
        </div>
    );
};

export default SearchBar;
