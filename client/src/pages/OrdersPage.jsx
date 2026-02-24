import React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import orderService from '../services/order.service';
import Loader from '../components/ui/Loader';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const response = await orderService.getOrders();
            setOrders(response.data || []);
        } catch (_error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleCancelOrder = async (id) => {
        try {
            await orderService.cancelOrder(id, 'Cancelled by user');
            toast.success('Order cancelled');
            loadOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to cancel order');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="orders-page">
            <h1>My Orders</h1>
            {!orders.length ? (
                <p className="empty-state">No orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article key={order._id} className="order-card">
                            <div>
                                <h3>{order.orderNumber}</h3>
                                <p>{format(new Date(order.createdAt), 'MMM d, yyyy - h:mm a')}</p>
                            </div>
                            <div>
                                <b>${order.totalAmount.toFixed(2)}</b>
                                <p className="capitalize">{order.orderStatus.replaceAll('_', ' ')}</p>
                            </div>
                            {['pending', 'confirmed'].includes(order.orderStatus) ? (
                                <button type="button" onClick={() => handleCancelOrder(order._id)}>
                                    Cancel
                                </button>
                            ) : null}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
