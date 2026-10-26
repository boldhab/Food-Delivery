const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

async function testAllAPIs() {
    console.log('🚀 Starting Comprehensive API Health & Route Verification...\n');
    let passed = 0;
    let failed = 0;
    const failures = [];

    async function check(name, testFn) {
        process.stdout.write(`Testing: ${name}... `);
        try {
            await testFn();
            console.log('✅ PASS');
            passed++;
        } catch (err) {
            console.log('❌ FAIL:', err.message);
            failures.push({ name, error: err.message });
            failed++;
        }
    }

    try {
        // 1. Auth Tokens
        let adminToken = '';
        let userToken = '';
        let driverToken = '';
        let userId = '';

        await check('Auth: Login as Customer', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'user@foodiehub.com', password: 'User@123456' });
            if (res.status !== 200 || !res.body.data?.token) {
                throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
            }
            userToken = res.body.data.token;
            userId = res.body.data.id || res.body.data._id;
        });

        await check('Auth: Login as Admin', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@foodiehub.com', password: 'Admin@123456' });
            if (res.status !== 200 || !res.body.data?.token) {
                throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
            }
            adminToken = res.body.data.token;
        });

        await check('Auth: Login as Driver', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'driver@foodiehub.com', password: 'Driver@123456' });
            if (res.status !== 200 || !res.body.data?.token) {
                throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
            }
            driverToken = res.body.data.token;
        });

        await check('Auth: Get Profile', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200 || !res.body.data) {
                throw new Error(`Expected 200, got ${res.status}`);
            }
        });

        // 2. Foods
        let sampleFoodId = '';
        await check('Food: GET /api/foods (Browse list)', async () => {
            const res = await request(app).get('/api/foods');
            if (res.status !== 200 || !Array.isArray(res.body.data)) {
                throw new Error(`Expected 200, got ${res.status}`);
            }
            if (res.body.data.length > 0) {
                sampleFoodId = res.body.data[0].id || res.body.data[0]._id;
            }
        });

        await check('Food: GET /api/foods/categories/all', async () => {
            const res = await request(app).get('/api/foods/categories/all');
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Food: GET /api/foods/featured', async () => {
            const res = await request(app).get('/api/foods/featured');
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Food: GET /api/foods/search', async () => {
            const res = await request(app).get('/api/foods/search?keyword=burger');
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        if (sampleFoodId) {
            await check('Food: GET /api/foods/:id', async () => {
                const res = await request(app).get(`/api/foods/${sampleFoodId}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });
        }

        // 3. Cart
        let addedCartItemId = '';
        await check('Cart: Clear Cart', async () => {
            const res = await request(app)
                .delete('/api/cart/clear')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        if (sampleFoodId) {
            await check('Cart: Add Item to Cart', async () => {
                const res = await request(app)
                    .post('/api/cart/add')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ foodId: sampleFoodId, quantity: 2 });
                if (res.status !== 200 || !res.body.data) {
                    throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
                }
                const items = res.body.data.items || [];
                if (items.length > 0) {
                    addedCartItemId = items[0].id || items[0]._id;
                }
            });

            await check('Cart: Update Cart Item Quantity', async () => {
                if (!addedCartItemId) throw new Error('No cart item id');
                const res = await request(app)
                    .put(`/api/cart/item/${addedCartItemId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ quantity: 3 });
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
            });

            await check('Cart: GET /api/cart', async () => {
                const res = await request(app)
                    .get('/api/cart')
                    .set('Authorization', `Bearer ${userToken}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });

            await check('Cart: GET /api/cart/summary', async () => {
                const res = await request(app)
                    .get('/api/cart/summary')
                    .set('Authorization', `Bearer ${userToken}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });

            await check('Cart: GET /api/cart/count', async () => {
                const res = await request(app)
                    .get('/api/cart/count')
                    .set('Authorization', `Bearer ${userToken}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });
        }

        // 4. Orders
        let placedOrderId = '';
        await check('Order: Place Order (POST /api/orders)', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    paymentMethod: 'cash_on_delivery',
                    deliveryAddress: {
                        street: 'Bole Road, House 102',
                        city: 'Addis Ababa',
                        state: 'Addis Ababa',
                        zipCode: '1000'
                    },
                    specialInstructions: 'Ring bell'
                });
            if (res.status !== 201 || !res.body.data) {
                throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
            }
            placedOrderId = res.body.data.id || res.body.data._id;
        });

        await check('Order: GET /api/orders/my-orders', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200 || !Array.isArray(res.body.data)) {
                throw new Error(`Expected 200, got ${res.status}`);
            }
        });

        if (placedOrderId) {
            await check('Order: GET /api/orders/:id', async () => {
                const res = await request(app)
                    .get(`/api/orders/${placedOrderId}`)
                    .set('Authorization', `Bearer ${userToken}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });

            await check('Order: POST /api/orders/:id/messages (Chat)', async () => {
                const res = await request(app)
                    .post(`/api/orders/${placedOrderId}/messages`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ message: 'Hello courier!' });
                if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
            });

            await check('Order: GET /api/orders/:id/messages', async () => {
                const res = await request(app)
                    .get(`/api/orders/${placedOrderId}/messages`)
                    .set('Authorization', `Bearer ${userToken}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });
        }

        // 5. Driver Portal Endpoints
        await check('Driver: GET /api/orders/driver/available', async () => {
            const res = await request(app)
                .get('/api/orders/driver/available')
                .set('Authorization', `Bearer ${driverToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Driver: GET /api/orders/driver/my-deliveries', async () => {
            const res = await request(app)
                .get('/api/orders/driver/my-deliveries')
                .set('Authorization', `Bearer ${driverToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        // 6. Promotions
        await check('Promotion: GET /api/promotions/active', async () => {
            const res = await request(app).get('/api/promotions/active');
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        // 7. Notifications
        await check('Notification: GET /api/notifications', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Notification: PUT /api/notifications/read-all', async () => {
            const res = await request(app)
                .put('/api/notifications/read-all')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        // 8. Reviews
        await check('Review: GET /api/reviews/me', async () => {
            const res = await request(app)
                .get('/api/reviews/me')
                .set('Authorization', `Bearer ${userToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        if (sampleFoodId) {
            await check('Review: GET /api/reviews/food/:foodId', async () => {
                const res = await request(app).get(`/api/reviews/food/${sampleFoodId}`);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });
        }

        // 9. Admin Endpoints
        await check('Admin: GET /api/admin/dashboard/stats', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard/stats')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
        });

        await check('Admin: GET /api/admin/dashboard/sales-report', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard/sales-report')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/orders', async () => {
            const res = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/drivers/available', async () => {
            const res = await request(app)
                .get('/api/admin/drivers/available')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/settings', async () => {
            const res = await request(app)
                .get('/api/admin/settings')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/foods', async () => {
            const res = await request(app)
                .get('/api/admin/foods')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/foods/alerts', async () => {
            const res = await request(app)
                .get('/api/admin/foods/alerts')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/promotions', async () => {
            const res = await request(app)
                .get('/api/admin/promotions')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

        await check('Admin: GET /api/admin/notifications', async () => {
            const res = await request(app)
                .get('/api/admin/notifications')
                .set('Authorization', `Bearer ${adminToken}`);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        });

    } catch (unexpected) {
        console.error('Unexpected crash in test suite:', unexpected);
    } finally {
        console.log('\n=======================================');
        console.log(`TOTAL PASSED: ${passed}`);
        console.log(`TOTAL FAILED: ${failed}`);
        console.log('=======================================');
        if (failures.length > 0) {
            console.log('Failures:', failures);
        }
        await prisma.$disconnect();
        process.exit(failed > 0 ? 1 : 0);
    }
}

testAllAPIs();
