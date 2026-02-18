import api from './api';

const orderService = {
    getOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },
};

export default orderService;
