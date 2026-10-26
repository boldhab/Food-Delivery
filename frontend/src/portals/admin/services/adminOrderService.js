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

    async getOrderStats() {
        const response = await adminApi.get('/admin/dashboard/stats');
        const payload = response?.data?.data || response?.data || {};
        const overview = payload?.overview || {};
        const ordersByStatus = Array.isArray(payload?.ordersByStatus) ? payload.ordersByStatus : [];
        const pendingOrders = ordersByStatus.find((item) => item?._id === 'pending')?.count || 0;

        return {
            success: response?.data?.success ?? true,
            data: {
                totalOrders: Number(overview?.totalOrders || 0),
                totalRevenue: Number(overview?.totalRevenue || 0),
                averageOrderValue: Number(overview?.averageOrderValue || 0),
                pendingOrders: Number(pendingOrders || 0),
                completedOrders: Number(overview?.completedOrders || 0),
                cancelledOrders: Number(overview?.cancelledOrders || 0),
                ordersByStatus
            }
        };
    }

    async getAvailableDrivers() {
        // Use stable users endpoint to avoid noisy 404s in mixed backend versions
        const response = await adminApi.get('/admin/users', {
            params: { role: 'driver', limit: 100 }
        });
        const users = response?.data?.data?.users || [];
        return {
            success: true,
            data: users.filter((user) => user?.isActive)
        };
    }

    async assignDriver(orderId, driverId, note = 'Driver assigned by admin') {
        try {
            const response = await adminApi.put(`/admin/orders/${orderId}/assign-driver`, {
                driverId,
                note
            });
            return response?.data?.data;
        } catch (error) {
            if (error?.response?.status !== 404) {
                throw error;
            }
            const fallback = await adminApi.put(`/orders/admin/${orderId}/assign-driver`, {
                driverId,
                note
            });
            return fallback?.data?.data;
        }
    }
}

export default new AdminOrderService();
