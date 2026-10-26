const request = require('supertest');
const app = require('../src/app');

describe('Auth & Health API', () => {
    it('GET /api/test should return 200 with server status', async () => {
        const res = await request(app).get('/api/test');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Server & MongoDB connected!');
    });

    it('POST /api/auth/login should reject empty credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register should reject empty registration data', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/forgot-password should reject invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'not-an-email' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/reset-password should reject empty token and password', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/google should reject request with no email or credential', async () => {
        const res = await request(app)
            .post('/api/auth/google')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/driver-apply should reject incomplete courier application', async () => {
        const res = await request(app)
            .post('/api/auth/driver-apply')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
