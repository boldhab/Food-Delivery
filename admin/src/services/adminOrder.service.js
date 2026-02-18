import adminApi from './adminApi';

const adminOrderService = {
    getAllOrders: async () => {
        const response = await adminApi.get('/orders');
        return response.data;
    },
};

export default adminOrderService;
