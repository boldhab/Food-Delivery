import adminApi from './adminApi';

class AdminReportService {
    async getSalesReport(params = {}) {
        const response = await adminApi.get('/admin/reports/sales', { params });
        return response.data;
    }

    async getInventoryReport(params = {}) {
        const response = await adminApi.get('/admin/reports/inventory', { params });
        return response.data;
    }

    async getUserReport(params = {}) {
        const response = await adminApi.get('/admin/reports/users', { params });
        return response.data;
    }

    async getDriverReport(params = {}) {
        const response = await adminApi.get('/admin/reports/drivers', { params });
        return response.data;
    }

    async getFinancialReport(params = {}) {
        const response = await adminApi.get('/admin/reports/financial', { params });
        return response.data;
    }

    async getAnalyticsReport(params = {}) {
        const response = await adminApi.get('/admin/reports/analytics', { params });
        return response.data;
    }
}

export default new AdminReportService();
