import React, { useState } from 'react';
import adminOrderService from '../../services/adminOrderService';

const statusOptions = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const OrderStatusUpdate = ({ order, onUpdate }) => {
    const [status, setStatus] = useState(order?.orderStatus || 'pending');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!order?._id) {
            return;
        }

        setSubmitting(true);
        try {
            await adminOrderService.updateOrderStatus(order._id, { status });
            await onUpdate?.();
        } catch (error) {
            console.error('Failed to update order status:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Update Order Status</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={submitting}>
                {statusOptions.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            <button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update'}
            </button>
        </form>
    );
};

export default OrderStatusUpdate;
