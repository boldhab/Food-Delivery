import api from './api';

const orderService = {
    getOrders: async (params = {}) => {
        const response = await api.get('/orders/my-orders', { params });
        return response.data;
    },

    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    cancelOrder: async (id, reason) => {
        const response = await api.put(`/orders/${id}/cancel`, { reason });
        return response.data;
    },
};

export default orderService;
