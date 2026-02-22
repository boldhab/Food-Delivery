import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, type = 'order' }) => {
    const getOrderStatusConfig = (value) => {
        const config = {
            pending: { color: 'gold', label: 'Pending' },
            confirmed: { color: 'blue', label: 'Confirmed' },
            preparing: { color: 'orange', label: 'Preparing' },
            out_for_delivery: { color: 'purple', label: 'Out for Delivery' },
            delivered: { color: 'green', label: 'Delivered' },
            cancelled: { color: 'red', label: 'Cancelled' },
            rejected: { color: 'red', label: 'Rejected' }
        };
        return config[value] || { color: 'gray', label: value || 'Unknown' };
    };

    const getPaymentStatusConfig = (value) => {
        const config = {
            pending: { color: 'gold', label: 'Pending' },
            paid: { color: 'green', label: 'Paid' },
            failed: { color: 'red', label: 'Failed' },
            refunded: { color: 'purple', label: 'Refunded' }
        };
        return config[value] || { color: 'gray', label: value || 'Unknown' };
    };

    const getFoodStatusConfig = (isAvailable) => {
        return isAvailable ? { color: 'green', label: 'Available' } : { color: 'red', label: 'Unavailable' };
    };

    const config =
        type === 'order'
            ? getOrderStatusConfig(status)
            : type === 'payment'
              ? getPaymentStatusConfig(status)
              : getFoodStatusConfig(status);

    return <span className={`status-badge ${config.color}`}>{config.label}</span>;
};

export default StatusBadge;
