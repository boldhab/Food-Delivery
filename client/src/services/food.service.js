import api from './api';

const foodService = {
    getFoods: async () => {
        const response = await api.get('/foods');
        return response.data;
    },
};

export default foodService;
