import adminApi from './adminApi';

class AdminStatsService {
    async getStats(params = {}) {
        const response = await adminApi.get('/admin/dashboard/stats', { params });
        return response.data;
    }

    async exportData(type, format, params = {}) {
        const response = await adminApi.get(`/admin/export/${type}`, {
            params: { format, ...params },
            responseType: 'blob'
        });
        return {
            data: response.data,
            headers: response.headers
        };
    }
}

export default new AdminStatsService();
