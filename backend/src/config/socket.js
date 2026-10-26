const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:3000',
                process.env.CLIENT_URL || '*'
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        // Client joins order-specific room for real-time tracking & chat
        socket.on('join_order', (orderId) => {
            if (orderId) {
                const room = `order_${orderId}`;
                socket.join(room);
            }
        });

        socket.on('leave_order', (orderId) => {
            if (orderId) {
                const room = `order_${orderId}`;
                socket.leave(room);
            }
        });

        // Client joins personal user channel for private notifications
        socket.on('join_user', (userId) => {
            if (userId) {
                const room = `user_${userId}`;
                socket.join(room);
            }
        });

        // Driver / Admin rooms
        socket.on('join_drivers', () => {
            socket.join('drivers');
        });

        socket.on('join_admins', () => {
            socket.join('admins');
        });

        // Live driver GPS location streaming with safe parameter guards
        socket.on('update_driver_location', (payload) => {
            try {
                if (!payload || typeof payload !== 'object') return;
                const { orderId, latitude, longitude } = payload;
                if (!orderId || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
                    return;
                }
                const lat = Number(latitude);
                const lng = Number(longitude);
                if (Number.isNaN(lat) || Number.isNaN(lng)) return;

                io.to(`order_${orderId}`).emit('driver_location', {
                    orderId,
                    latitude: lat,
                    longitude: lng,
                    timestamp: new Date()
                });
            } catch (err) {
                console.error('⚠️ Error in update_driver_location socket event:', err.message);
            }
        });

        socket.on('disconnect', () => {
            // disconnected cleanly
        });
    });

    return io;
};

const getIO = () => {
    return io;
};

// Real-time helper emitters
const emitOrderUpdate = (orderId, orderData) => {
    if (io && orderId) {
        io.to(`order_${orderId}`).emit('order_updated', orderData);
        if (orderData?.userId) {
            io.to(`user_${orderData.userId}`).emit('user_order_updated', orderData);
        }
        io.to('admins').emit('admin_order_updated', orderData);
    }
};

const emitNewMessage = (orderId, messageData) => {
    if (io && orderId) {
        io.to(`order_${orderId}`).emit('new_message', messageData);
    }
};

const emitNewOrder = (orderData) => {
    if (io && orderData) {
        io.to('admins').emit('new_order_placed', orderData);
        io.to('drivers').emit('new_delivery_available', orderData);
    }
};

const emitDriverLocation = (orderId, coords) => {
    if (io && orderId) {
        io.to(`order_${orderId}`).emit('driver_location', coords);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitOrderUpdate,
    emitNewMessage,
    emitNewOrder,
    emitDriverLocation
};
