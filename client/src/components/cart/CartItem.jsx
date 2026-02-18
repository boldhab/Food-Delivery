import React from 'react';

const CartItem = ({ item }) => {
  return (
    <div>
      {item?.name}
    </div>
  );
};

export default CartItem;
