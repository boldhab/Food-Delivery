import adminApi from './adminApi';

class AdminFoodService {
    async getFoods(params = {}) {
        const response = await adminApi.get('/admin/foods', { params });
        return response.data;
    }

    async getFoodsWithStats(params = {}) {
        return this.getFoods(params);
    }

    async getFoodById(id) {
        const response = await adminApi.get(`/foods/${id}`);
        return response.data;
    }

    async getInventoryAlerts() {
        const response = await adminApi.get('/admin/foods/alerts');
        return response.data;
    }

    async createFood(data) {
        const response = await adminApi.post('/foods', data);
        return response.data;
    }

    async updateFood(id, data) {
        const response = await adminApi.put(`/foods/${id}`, data);
        return response.data;
    }

    async deleteFood(id) {
        const response = await adminApi.delete(`/foods/${id}`);
        return response.data;
    }

    async toggleAvailability(id) {
        const response = await adminApi.patch(`/foods/${id}/toggle-availability`);
        return response.data;
    }

    async updateFoodAvailability(id) {
        return this.toggleAvailability(id);
    }
}

export default new AdminFoodService();
