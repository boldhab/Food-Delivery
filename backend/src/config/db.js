const prisma = require('./prisma');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await prisma.$connect();
            console.log('✅ PostgreSQL connected via Prisma ORM');
            return true;
        } catch (error) {
            console.error(`⚠️ PostgreSQL connection attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt < retries) {
                console.log(`⏳ Retrying in ${delay / 1000}s...`);
                await sleep(delay);
            }
        }
    }

    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Could not connect to PostgreSQL after multiple attempts in production.');
        process.exit(1);
    } else {
        console.warn(
            '⚠️ Server continuing in development mode without active database connection.\n' +
            '👉 Please ensure PostgreSQL is running (e.g., at localhost:5432). Prisma will automatically reconnect once available.'
        );
        return false;
    }
};

module.exports = connectDB;
