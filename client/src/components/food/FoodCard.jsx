import React from 'react';

const FoodCard = ({ food }) => {
  return (
    <div className="food-card">
      <h3>{food?.name}</h3>
    </div>
  );
};

export default FoodCard;
