import { useMemo, useState } from 'react';

const useAdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications]
    );

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read: true } : item))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
};

export default useAdminNotifications;
