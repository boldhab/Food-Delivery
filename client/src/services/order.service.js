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

    getOrderMessages: async (id) => {
        const response = await api.get(`/orders/${id}/messages`);
        return response.data;
    },

    sendOrderMessage: async (id, message) => {
        const response = await api.post(`/orders/${id}/messages`, { message });
        return response.data;
    },

    getOrderStats: async () => {
        try {
            const response = await api.get('/orders/stats');
            return response.data;
        } catch (error) {
            // Fallback for APIs that don't expose a dedicated stats endpoint.
            if (error?.response?.status !== 404) {
                throw error;
            }

            const ordersResponse = await api.get('/orders/my-orders');
            const raw = ordersResponse.data;
            const orders = Array.isArray(raw) ? raw : raw?.data || [];

            const stats = orders.reduce(
                (acc, order) => {
                    const status = order?.orderStatus || order?.status;
                    acc.total += 1;
                    if (status === 'delivered') acc.delivered += 1;
                    if (status === 'cancelled') acc.cancelled += 1;
                    return acc;
                },
                { total: 0, delivered: 0, cancelled: 0 }
            );

            return { data: stats };
        }
    },
};

export default orderService;
