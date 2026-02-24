import api from './api';

const foodService = {
    getFoods: async (params = {}) => {
        const response = await api.get('/foods', { params });
        return response.data;
    },

    getFeaturedFoods: async () => {
        const response = await api.get('/foods/featured');
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/foods/categories/all');
        return response.data;
    },

    searchFoods: async (keyword) => {
        const response = await api.get('/foods/search', { params: { keyword } });
        return response.data;
    },

    getFoodById: async (id) => {
        const response = await api.get(`/foods/${id}`);
        return response.data;
    },
};

export default foodService;
