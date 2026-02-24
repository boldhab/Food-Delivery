import React from 'react';

const FoodFilter = ({ keyword, onKeywordChange, category, categories, onCategoryChange }) => {
    return (
        <div className="food-filter">
            <input
                type="text"
                placeholder="Search by name, category, or description"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
            />
            <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
                <option value="">All Categories</option>
                {categories.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FoodFilter;
