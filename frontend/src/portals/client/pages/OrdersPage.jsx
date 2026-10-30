import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
    FiPackage, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle, 
    FiTruck, 
    FiHome 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import orderService from '../services/order.service';
import Loader from '../components/ui/Loader';
import useCart from '../hooks/useCart';

import OrdersHeader from './orders/components/OrdersHeader';
import OrderEmptyState from './orders/components/OrderEmptyState';
import OrderItemCard from './orders/components/OrderItemCard';

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addItem, openCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [orderMessages, setOrderMessages] = useState({});
    const [messageInputs, setMessageInputs] = useState({});
    const [sendingMessageFor, setSendingMessageFor] = useState('');

    // Load orders with error handling
    const loadOrders = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await orderService.getOrders();
            setOrders(response.data || []);
        } catch (error) {
            toast.error('Failed to load orders. Please try again.', {
                duration: 4000,
                icon: '🔔'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const loadOrderMessages = async (orderId) => {
        try {
            const response = await orderService.getOrderMessages(orderId);
            setOrderMessages((prev) => ({
                ...prev,
                [orderId]: Array.isArray(response?.data) ? response.data : []
            }));
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load messages');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openOrderId = params.get('openOrder');
        if (!openOrderId || orders.length === 0) return;

        const exists = orders.some((order) => order._id === openOrderId);
        if (!exists) return;

        setExpandedOrders((prev) => {
            const next = new Set(prev);
            next.add(openOrderId);
            return next;
        });
        if (!orderMessages[openOrderId]) {
            loadOrderMessages(openOrderId);
        }
    }, [location.search, orders, orderMessages]);

    // Handle order cancellation
    const handleCancelOrder = async (orderId) => {
        const confirm = window.confirm('Are you sure you want to cancel this order?');
        if (!confirm) return;

        try {
            await orderService.cancelOrder(orderId, 'Cancelled by user');
            toast.success('Order cancelled successfully', {
                icon: '✅',
                duration: 3000
            });
            loadOrders(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to cancel order', {
                icon: '❌',
                duration: 4000
            });
        }
    };

    // Handle 1-Click Reorder
    const handleReorder = async (order) => {
        if (!order?.items || !order.items.length) {
            toast.error('No items found in this order');
            return;
        }

        const toastId = toast.loading('Adding dishes to cart...');
        try {
            let addedCount = 0;
            for (const item of order.items) {
                const foodId = item.foodId?._id || item.foodId?.id || item.foodId || item.food?._id || item.food?.id;
                if (foodId) {
                    await addItem(foodId, item.quantity || 1);
                    addedCount++;
                }
            }
            toast.dismiss(toastId);
            if (addedCount > 0) {
                toast.success(`Reordered ${addedCount} dish${addedCount > 1 ? 'es' : ''}! Ready to checkout.`, {
                    icon: '🛒',
                    duration: 3500
                });
                openCart();
            } else {
                toast.error('Dishes in this order could not be re-added');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(error?.response?.data?.message || 'Failed to reorder items');
        }
    };

    // Handle order tracking
    const handleTrackOrder = (orderId) => {
        navigate(`/orders/track/${orderId}`);
    };

    // Handle order details toggle
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
                if (!orderMessages[orderId]) {
                    loadOrderMessages(orderId);
                }
            }
            return newSet;
        });
    };

    const handleSendOrderMessage = async (orderId) => {
        const text = (messageInputs[orderId] || '').trim();
        if (!text) return;

        setSendingMessageFor(orderId);
        try {
            await orderService.sendOrderMessage(orderId, text);
            setMessageInputs((prev) => ({ ...prev, [orderId]: '' }));
            await loadOrderMessages(orderId);
            toast.success('Message sent');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to send message');
        } finally {
            setSendingMessageFor('');
        }
    };

    // Filter and sort orders
    const getFilteredOrders = () => {
        let filtered = [...orders];

        if (filter !== 'all') {
            filtered = filtered.filter(order => order.orderStatus === filter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
                case 'lowest':
                    return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Status configuration with icon and styling
    const getStatusConfig = (status) => {
        const configs = {
            pending: { 
                color: 'yellow', 
                icon: FiClock, 
                bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                text: 'text-yellow-700 dark:text-yellow-300',
                label: 'Pending'
            },
            confirmed: { 
                color: 'blue', 
                icon: FiCheckCircle, 
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-700 dark:text-blue-300',
                label: 'Confirmed'
            },
            preparing: { 
                color: 'orange', 
                icon: FiPackage, 
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-700 dark:text-amber-300',
                label: 'Preparing'
            },
            out_for_delivery: { 
                color: 'purple', 
                icon: FiTruck, 
                bg: 'bg-purple-100 dark:bg-purple-900/30',
                text: 'text-purple-700 dark:text-purple-300',
                label: 'Out for Delivery'
            },
            delivered: { 
                color: 'green', 
                icon: FiHome, 
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-700 dark:text-green-300',
                label: 'Delivered'
            },
            cancelled: { 
                color: 'red', 
                icon: FiXCircle, 
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-700 dark:text-red-300',
                label: 'Cancelled'
            }
        };
        return configs[status] || configs.pending;
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                        Loading your orders...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header with Title, Count, Refresh and Filter Options */}
            <OrdersHeader
                orderCount={filteredOrders.length}
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onRefresh={() => loadOrders(true)}
                refreshing={refreshing}
            />

            {/* Orders Content Area */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                {filteredOrders.length === 0 ? (
                    <OrderEmptyState onBrowseMenu={() => navigate('/menu')} />
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredOrders.map((order, index) => (
                                <OrderItemCard
                                    key={order._id}
                                    order={order}
                                    index={index}
                                    statusConfig={getStatusConfig(order.orderStatus)}
                                    isExpanded={expandedOrders.has(order._id)}
                                    onToggleDetails={toggleOrderDetails}
                                    onCancelOrder={handleCancelOrder}
                                    onTrackOrder={handleTrackOrder}
                                    onReorder={handleReorder}
                                    orderMessages={orderMessages}
                                    messageInput={messageInputs[order._id]}
                                    onMessageInputChange={(id, val) =>
                                        setMessageInputs((prev) => ({ ...prev, [id]: val }))
                                    }
                                    onSendMessage={handleSendOrderMessage}
                                    isSendingMessage={sendingMessageFor === order._id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
