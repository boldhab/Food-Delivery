const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { validateEnvironment } = require('./config/env');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    validateEnvironment();
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
