import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search...', className = '' }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form className={`search-bar ${className}`} onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
            />
            <button type="submit" aria-label="Search">
                <FiSearch />
            </button>
        </form>
    );
};

export default SearchBar;
