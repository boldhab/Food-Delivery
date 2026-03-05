import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import adminNotificationService from '../services/adminNotificationService';

const useAdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const normalizeNotification = useCallback((item) => ({
        id: item?._id,
        title: item?.title || 'Notification',
        message: item?.message || '',
        read: Boolean(item?.read),
        type: item?.type || 'info',
        link: item?.link || '/admin/orders',
        time: item?.createdAt
            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
            : 'just now'
    }), []);

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminNotificationService.getNotifications({ limit: 30 });
            const items = response?.data?.notifications || [];
            setNotifications(items.map(normalizeNotification));
        } catch (error) {
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [normalizeNotification]);

    useEffect(() => {
        loadNotifications();

        const intervalId = window.setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => window.clearInterval(intervalId);
    }, [loadNotifications]);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications]
    );

    const markAsRead = async (id) => {
        if (!id) return;

        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read: true } : item))
        );

        try {
            await adminNotificationService.markAsRead(id);
        } catch (error) {
            loadNotifications();
        }
    };

    const markAllAsRead = async () => {
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read: true }))
        );

        try {
            await adminNotificationService.markAllAsRead();
        } catch (error) {
            loadNotifications();
        }
    };

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications
    };
};

export default useAdminNotifications;
