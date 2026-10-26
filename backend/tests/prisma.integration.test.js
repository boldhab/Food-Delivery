const prisma = require('../src/config/prisma');
const authService = require('../src/services/auth.service');
const foodService = require('../src/services/food.service');

describe('PostgreSQL Prisma Integration Tests', () => {
    let dbConnected = false;

    beforeAll(async () => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            dbConnected = true;
        } catch {
            console.warn(
                '\n⚠️ PostgreSQL database container is not reachable at localhost:5432.\n' +
                '   Run `npm run db:up` and `npm run db:seed` to execute integration tests.\n'
            );
        }
    });

    afterAll(async () => {
        if (dbConnected) {
            await prisma.$disconnect().catch(() => {});
        }
    });

    it('should query seeded admin from PostgreSQL database', async () => {
        if (!dbConnected) {
            console.log('Skipped: database container offline');
            return;
        }
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@foodiehub.com' }
        });
        expect(admin).not.toBeNull();
        expect(admin.role).toBe('admin');
        expect(admin.email).toBe('admin@foodiehub.com');
    });

    it('should query seeded menu items with relational integrity', async () => {
        if (!dbConnected) {
            console.log('Skipped: database container offline');
            return;
        }
        const foods = await foodService.getAllFoods();
        expect(foods.foods.length).toBeGreaterThanOrEqual(5);
        expect(foods.foods[0]).toHaveProperty('name');
        expect(foods.foods[0]).toHaveProperty('price');
        expect(foods.foods[0]).toHaveProperty('category');
    });

    it('should authenticate seeded driver via authService', async () => {
        if (!dbConnected) {
            console.log('Skipped: database container offline');
            return;
        }
        const loginResult = await authService.login({
            email: 'driver@foodiehub.com',
            password: 'Driver@123456'
        });
        expect(loginResult).toHaveProperty('token');
        expect(loginResult.role).toBe('driver');
        expect(loginResult.driverProfile).not.toBeNull();
    });
});
