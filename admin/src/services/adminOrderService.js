import adminApi from './adminApi';

class AdminOrderService {
    async getOrders(params = {}) {
        const response = await adminApi.get('/admin/orders', { params });
        return response.data;
    }

    async getOrderById(id) {
        const response = await adminApi.get(`/orders/${id}`);
        return response.data;
    }

    async updateOrderStatus(id, data) {
        const response = await adminApi.put(`/admin/orders/${id}/status`, data);
        return response.data;
    }

    async getDashboardStats() {
        const response = await adminApi.get('/admin/dashboard/stats');
        return response.data;
    }

    async getSalesReport(params) {
        const response = await adminApi.get('/admin/dashboard/sales-report', { params });
        return response.data;
    }
}

export default new AdminOrderService();
