import api from './api';

const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
};

export default cartService;
