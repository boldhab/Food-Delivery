const request = require('supertest');
const app = require('../src/app');
const {
    calculateOrderTotals,
    isValidStatusTransition,
    getStatusDescription
} = require('../src/utils/order.utils');

describe('Order Utils & Calculations', () => {
    it('should calculate tax and standard delivery fee for subtotal <= 600', () => {
        const { tax, deliveryFee, total } = calculateOrderTotals(300);
        expect(tax).toBe(45); // 15% of 300
        expect(deliveryFee).toBe(80);
        expect(total).toBe(425);
    });

    it('should waive delivery fee when subtotal > 600', () => {
        const { tax, deliveryFee, total } = calculateOrderTotals(700);
        expect(tax).toBe(105); // 15% of 700
        expect(deliveryFee).toBe(0);
        expect(total).toBe(805);
    });

    it('should validate status transitions accurately', () => {
        expect(isValidStatusTransition('pending', 'confirmed')).toBe(true);
        expect(isValidStatusTransition('pending', 'cancelled')).toBe(true);
        expect(isValidStatusTransition('preparing', 'out_for_delivery')).toBe(true);
        expect(isValidStatusTransition('delivered', 'pending')).toBe(false);
        expect(isValidStatusTransition('cancelled', 'confirmed')).toBe(false);
    });

    it('should provide human-readable status descriptions', () => {
        expect(getStatusDescription('pending')).toBe('Order placed and waiting for confirmation');
        expect(getStatusDescription('delivered')).toBe('Order has been delivered');
    });
});

describe('Order API Authorization', () => {
    it('GET /api/orders/my-orders should reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/orders/my-orders');
        expect(res.statusCode).toBe(401);
    });
});
