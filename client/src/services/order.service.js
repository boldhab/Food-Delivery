import api from './api';

const orderService = {
    getOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },
};

export default orderService;
