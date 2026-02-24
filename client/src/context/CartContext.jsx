import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import cartService from '../services/cart.service';
import { useAuthContext } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuthContext();
    const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
    const [loading, setLoading] = useState(false);

    const loadCart = async () => {
        if (!isAuthenticated) {
            setCart({ items: [], subtotal: 0, totalItems: 0 });
            return;
        }
        setLoading(true);
        try {
            const response = await cartService.getCart();
            setCart(response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, [isAuthenticated]);

    const addItem = async (foodId, quantity = 1) => {
        const response = await cartService.addToCart(foodId, quantity);
        setCart(response.data);
        return response;
    };

    const updateItem = async (itemId, quantity) => {
        const response = await cartService.updateCartItem(itemId, quantity);
        setCart(response.data);
        return response;
    };

    const removeItem = async (itemId) => {
        const response = await cartService.removeFromCart(itemId);
        setCart(response.data);
        return response;
    };

    const clearCart = async () => {
        const response = await cartService.clearCart();
        setCart(response.data);
        return response;
    };

    const value = useMemo(
        () => ({
            cart,
            loading,
            loadCart,
            addItem,
            updateItem,
            removeItem,
            clearCart,
        }),
        [cart, loading]
    );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
