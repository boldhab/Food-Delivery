const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { validateEnvironment } = require('./config/env');
const { initSocket } = require('./config/socket');

// Global process error handlers to prevent unexpected server termination
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
    validateEnvironment();
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    let currentPort = PORT;
    let attempts = 0;
    const maxRetries = 5;

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            attempts++;
            console.error(`⚠️ Port ${currentPort} is already in use by another process.`);

            if (process.env.NODE_ENV !== 'production' && attempts <= maxRetries) {
                const nextPort = currentPort + 1;
                console.warn(
                    `⏳ Trying fallback port ${nextPort}... (Ensure frontend VITE_API_BASE_URL points to ${nextPort} if needed)`
                );
                currentPort = nextPort;
                setTimeout(() => {
                    server.listen(nextPort);
                }, 500);
            } else {
                console.error(
                    `❌ Port ${PORT} is occupied. Free it using: fuser -k ${PORT}/tcp or kill-port ${PORT}`
                );
                process.exit(1);
            }
        } else {
            console.error('❌ Server startup error:', err.message);
            process.exit(1);
        }
    });

    server.on('listening', () => {
        const address = server.address();
        const activePort = typeof address === 'string' ? address : address?.port;
        console.log(`🚀 Server and WebSockets running on port ${activePort}`);
        if (activePort !== PORT) {
            console.warn(`⚠️ Note: Running on fallback port ${activePort} because ${PORT} was occupied.`);
        }
    });

    // Graceful shutdown to release port on stop or nodemon restart
    const handleShutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}. Gracefully closing server...`);
        server.close(() => {
            console.log('✅ Server and WebSockets closed cleanly.');
            process.exit(0);
        });
        setTimeout(() => {
            process.exit(1);
        }, 3000).unref();
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.once('SIGUSR2', () => {
        server.close(() => {
            process.kill(process.pid, 'SIGUSR2');
        });
    });

    server.listen(currentPort);
};

startServer();
