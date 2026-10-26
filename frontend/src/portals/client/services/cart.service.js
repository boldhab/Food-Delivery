import api from './api';

const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (foodId, quantity = 1) => {
        const response = await api.post('/cart/add', { foodId, quantity });
        return response.data;
    },

    updateCartItem: async (itemId, quantity) => {
        const response = await api.put(`/cart/item/${itemId}`, { quantity });
        return response.data;
    },

    removeFromCart: async (itemId) => {
        const response = await api.delete(`/cart/item/${itemId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete('/cart/clear');
        return response.data;
    },

    getCartSummary: async () => {
        const response = await api.get('/cart/summary');
        return response.data;
    },

    getCartCount: async () => {
        const response = await api.get('/cart/count');
        return response.data;
    },
};

export default cartService;
