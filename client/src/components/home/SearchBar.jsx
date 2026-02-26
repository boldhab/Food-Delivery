import React from 'react';

const SearchBar = ({ value = '', onChange, placeholder = 'Search...' }) => {
    return (
        <div className="relative">
            <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.6-5.15a7.75 7.75 0 11-15.5 0 7.75 7.75 0 0115.5 0z"
                />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-900/40"
            />
        </div>
    );
};

export default SearchBar;
