import api from './api';

const promotionService = {
    async getActivePromotions() {
        const response = await api.get('/promotions/active');
        const data = response?.data?.data?.promotions || response?.data?.promotions || [];
        return Array.isArray(data) ? data : [];
    },

    async validatePromotion(code, orderAmount) {
        const response = await api.post('/promotions/validate', { code, orderAmount });
        return response.data;
    }
};

export default promotionService;
