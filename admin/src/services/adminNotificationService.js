import adminApi from './adminApi';

class AdminNotificationService {
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
