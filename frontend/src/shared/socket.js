import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');

    socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
  }
  return socketInstance;
};

export const joinOrderRoom = (orderId) => {
  if (!orderId) return;
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('join_order', orderId);
  } else {
    socket.once('connect', () => {
      socket.emit('join_order', orderId);
    });
  }
};

export const leaveOrderRoom = (orderId) => {
  if (!orderId) return;
  const socket = getSocket();
  socket.emit('leave_order', orderId);
};

export const joinUserRoom = (userId) => {
  if (!userId) return;
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('join_user', userId);
  } else {
    socket.once('connect', () => {
      socket.emit('join_user', userId);
    });
  }
};

export const emitDriverLocation = (orderId, latitude, longitude) => {
  if (!orderId || latitude == null || longitude == null) return;
  const socket = getSocket();
  socket.emit('update_driver_location', { orderId, latitude, longitude });
};

/**
 * React hook to listen for real-time order updates, incoming chat messages,
 * and live driver GPS streaming for a specific order.
 */
export const useOrderSocket = (orderId, handlers = {}) => {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    const handleOrderUpdated = (data) => {
      handlersRef.current?.onOrderUpdated?.(data);
    };

    const handleNewMessage = (data) => {
      handlersRef.current?.onNewMessage?.(data);
    };

    const handleDriverLocation = (data) => {
      handlersRef.current?.onDriverLocation?.(data);
    };

    socket.on('order_updated', handleOrderUpdated);
    socket.on('new_message', handleNewMessage);
    socket.on('driver_location', handleDriverLocation);

    joinOrderRoom(orderId);

    return () => {
      socket.off('order_updated', handleOrderUpdated);
      socket.off('new_message', handleNewMessage);
      socket.off('driver_location', handleDriverLocation);
      leaveOrderRoom(orderId);
    };
  }, [orderId]);

  return getSocket();
};

export default {
  getSocket,
  joinOrderRoom,
  leaveOrderRoom,
  joinUserRoom,
  emitDriverLocation,
  useOrderSocket
};
