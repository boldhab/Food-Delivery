import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMapPin, FiUser, FiDollarSign } from 'react-icons/fi';
import StatusBadge from '../components/common/StatusBadge';
import OrderStatusUpdate from '../components/orders/OrderStatusUpdate';
import adminOrderService from '../services/adminOrderService';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await adminOrderService.getOrderById(id);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading order details...</div>;
    if (!order) return <div className="error">Order not found</div>;

    return (
        <div className="order-detail-page">
            <button className="back-btn" onClick={() => navigate('/admin/orders')}>
                <FiArrowLeft /> Back to Orders
            </button>

            <div className="order-header">
                <h1>Order #{order.orderNumber}</h1>
                <StatusBadge status={order.orderStatus} type="order" />
            </div>

            <div className="order-content">
                <div className="order-info-grid">
                    <div className="info-card">
                        <h3><FiUser /> Customer Information</h3>
                        <p><strong>Name:</strong> {order.userDetails?.name}</p>
                        <p><strong>Email:</strong> {order.userDetails?.email}</p>
                        <p><strong>Phone:</strong> {order.userDetails?.phone}</p>
                    </div>

                    <div className="info-card">
                        <h3><FiMapPin /> Delivery Address</h3>
                        <p>{order.deliveryAddress?.street}</p>
                        <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                        <p>{order.deliveryAddress?.zipCode}</p>
                        {order.deliveryAddress?.instructions && <p><strong>Instructions:</strong> {order.deliveryAddress.instructions}</p>}
                    </div>

                    <div className="info-card">
                        <h3><FiDollarSign /> Payment Information</h3>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Status:</strong> <StatusBadge status={order.paymentStatus} type="payment" /></p>
                        {order.paymentId && <p><strong>Payment ID:</strong> {order.paymentId}</p>}
                    </div>

                    <div className="info-card">
                        <h3><FiClock /> Timeline</h3>
                        <p><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        {order.estimatedDeliveryTime && <p><strong>Est. Delivery:</strong> {new Date(order.estimatedDeliveryTime).toLocaleString()}</p>}
                        {order.actualDeliveryTime && <p><strong>Delivered:</strong> {new Date(order.actualDeliveryTime).toLocaleString()}</p>}
                    </div>
                </div>

                <div className="order-items">
                    <h2>Order Items</h2>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price?.toFixed(2)}</td>
                                    <td>${item.totalPrice?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="text-right">Subtotal:</td>
                                <td>${order.subtotal?.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="text-right">Tax:</td>
                                <td>${order.tax?.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="text-right">Delivery Fee:</td>
                                <td>${order.deliveryFee?.toFixed(2)}</td>
                            </tr>
                            <tr className="total-row">
                                <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                                <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <OrderStatusUpdate order={order} onUpdate={fetchOrderDetails} />
            </div>
        </div>
    );
};

export default OrderDetailPage;
