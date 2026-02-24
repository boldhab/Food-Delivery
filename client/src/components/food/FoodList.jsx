import React from 'react';
import FoodCard from './FoodCard';

const FoodList = ({ foods = [] }) => {
    if (!foods.length) {
        return <p className="empty-state">No items found.</p>;
    }

    return (
        <div className="food-grid">
            {foods.map((food) => (
                <FoodCard key={food._id} food={food} />
            ))}
        </div>
    );
};

export default FoodList;
