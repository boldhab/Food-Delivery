import api from './api';

const reviewService = {
    getFoodReviews: async (foodId) => {
        const response = await api.get(`/reviews/food/${foodId}`);
        return response.data;
    },

    addReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    deleteReview: async (reviewId) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    }
};

export default reviewService;
