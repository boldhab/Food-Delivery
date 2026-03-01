import adminApi from './adminApi';

class AdminStatsService {
    async getStats() {
        const response = await adminApi.get('/admin/dashboard/stats');
        return response.data;
    }

    async exportData(type, format) {
        const response = await adminApi.get(`/admin/export/${type}`, {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    }
}

export default new AdminStatsService();
