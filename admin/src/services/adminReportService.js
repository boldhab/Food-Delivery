import adminApi from './adminApi';

class AdminReportService {
    async getDashboardStats() {
        const response = await adminApi.get('/admin/dashboard/stats');
        return response?.data?.data || {};
    }

    async getSalesReport(params = {}) {
        const [salesResponse, stats] = await Promise.all([
            adminApi.get('/admin/dashboard/sales-report', { params }),
            this.getDashboardStats()
        ]);
        const sales = salesResponse?.data?.data || {};

        return {
            salesData: Array.isArray(sales.salesData)
                ? sales.salesData.map((entry) => ({
                    date: String(entry?._id ?? ''),
                    orders: Number(entry?.orders || 0),
                    revenue: Number(entry?.revenue || 0)
                }))
                : [],
            topSellingItems: Array.isArray(stats.topSellingFoods)
                ? stats.topSellingFoods.map((item) => ({
                    name: item?.name || 'Unknown',
                    orders: Number(item?.quantity || 0),
                    revenue: Number(item?.revenue || 0)
                }))
                : [],
            categoryDistribution: Array.isArray(sales.categorySales)
                ? sales.categorySales.map((entry) => ({
                    name: entry?._id || 'Uncategorized',
                    value: Number(entry?.revenue || 0)
                }))
                : [],
            hourlyOrders: Array.isArray(sales.salesData)
                ? sales.salesData.map((entry) => ({
                    hour: String(entry?._id ?? ''),
                    orders: Number(entry?.orders || 0)
                }))
                : [],
            paymentMethodDistribution: Array.isArray(stats.paymentMethods)
                ? stats.paymentMethods.map((entry) => ({
                    name: entry?._id || 'Unknown',
                    value: Number(entry?.count || 0)
                }))
                : []
        };
    }

    async getInventoryReport(params = {}) {
        void params;
        const response = await adminApi.get('/admin/foods/alerts');
        const alerts = response?.data?.data || [];

        return {
            inventoryAlerts: Array.isArray(alerts)
                ? alerts.map((item) => ({
                    item: item?.name || 'Unknown',
                    current: Number(item?.orderCount || 0),
                    threshold: 3
                }))
                : []
        };
    }

    async getUserReport(params = {}) {
        void params;
        const stats = await this.getDashboardStats();
        return { ...stats };
    }

    async getDriverReport(params = {}) {
        void params;
        return { driverPerformance: [] };
    }

    async getFinancialReport(params = {}) {
        void params;
        const stats = await this.getDashboardStats();
        return { ...stats };
    }

    async getAnalyticsReport(params = {}) {
        void params;
        const stats = await this.getDashboardStats();
        return { ...stats };
    }
}

export default new AdminReportService();
