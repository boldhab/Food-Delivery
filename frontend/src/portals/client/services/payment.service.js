import api from './api';

class PaymentService {
    async createPaymentIntent(orderId) {
        const response = await api.post('/payments/create-payment-intent', { orderId });
        return response.data;
    }

    async confirmPayment(paymentIntentId) {
        const response = await api.post('/payments/confirm', { paymentIntentId });
        return response.data;
    }

    async getPaymentMethods() {
        const response = await api.get('/payments/methods');
        return response.data;
    }

    async addPaymentMethod(paymentMethodId) {
        const response = await api.post('/payments/methods', { paymentMethodId });
        return response.data;
    }

    async removePaymentMethod(id) {
        const response = await api.delete(`/payments/methods/${id}`);
        return response.data;
    }
}

export default new PaymentService();
