import adminApi from './adminApi';

class AdminNotificationService {
    async getNotifications(params = {}) {
        const response = await adminApi.get('/admin/notifications', { params });
        return response.data;
    }

    async markAsRead(id) {
        const response = await adminApi.put(`/admin/notifications/${id}/read`);
        return response.data;
    }

    async markAllAsRead() {
        const response = await adminApi.put('/admin/notifications/read-all');
        return response.data;
    }

    async sendOrderEmail(orderId) {
        const response = await adminApi.post(`/admin/orders/${orderId}/notify/email`);
        return response.data;
    }

    async sendOrderSMS(orderId) {
        const response = await adminApi.post(`/admin/orders/${orderId}/notify/sms`);
        return response.data;
    }

    async sendCustomerMessage(orderId, payload) {
        const response = await adminApi.post(`/admin/orders/${orderId}/notify/message`, payload);
        return response.data;
    }
}

export default new AdminNotificationService();
