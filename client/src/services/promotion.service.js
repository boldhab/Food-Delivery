import api from './api';

const promotionService = {
    async getActivePromotions() {
        const response = await api.get('/promotions/active');
        const data = response?.data?.data?.promotions || response?.data?.promotions || [];
        return Array.isArray(data) ? data : [];
    }
};

export default promotionService;
