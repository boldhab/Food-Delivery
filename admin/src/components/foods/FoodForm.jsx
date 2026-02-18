import React from 'react';

const FoodForm = () => {
  return (
    <form>
      <h2>Add/Edit Food</h2>
      <input type="text" placeholder="Food Name" />
      <button type="submit">Submit</button>
    </form>
  );
};

export default FoodForm;
