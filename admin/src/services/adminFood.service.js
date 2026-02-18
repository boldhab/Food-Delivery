import adminApi from './adminApi';

const adminFoodService = {
    getAllFoods: async () => {
        const response = await adminApi.get('/foods');
        return response.data;
    },
};

export default adminFoodService;
