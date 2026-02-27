import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
    FiPackage, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle, 
    FiTruck, 
    FiHome,
    FiMapPin,
    FiPhone,
    FiMail,
    FiPrinter,
    FiHelpCircle,
    FiStar,
    FiRefreshCw,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import Loader from '../components/ui/Loader';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [expandedOrders, setExpandedOrders] = useState(new Set());

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

    // Handle order cancellation
    const handleCancelOrder = async (orderId) => {
        // Confirm cancellation
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

    // Handle reorder
    const handleReorder = async (order) => {
        try {
            // Navigate to menu with items pre-filled
            navigate('/menu', { 
                state: { 
                    reorderItems: order.items,
                    restaurantId: order.restaurantId 
                } 
            });
            toast.success('Items added to your cart!', {
                icon: '🛒',
                duration: 3000
            });
        } catch (error) {
            toast.error('Failed to reorder items');
        }
    };

    // Handle order tracking
    const handleTrackOrder = (orderId) => {
        navigate(`/orders/track/${orderId}`);
    };

    // Handle order details
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    // Filter orders
    const getFilteredOrders = () => {
        let filtered = [...orders];

        // Apply status filter
        if (filter !== 'all') {
            filtered = filtered.filter(order => order.orderStatus === filter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return b.totalAmount - a.totalAmount;
                case 'lowest':
                    return a.totalAmount - b.totalAmount;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Get status color and icon
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
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-700 dark:text-green-300',
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
            {/* Header */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                My Orders
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                            </p>
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={() => loadOrders(true)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2
                                     bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-slate-700 dark:text-slate-300
                                     hover:border-green-500 transition-colors
                                     disabled:opacity-50"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-slate-700 dark:text-slate-300
                                     focus:outline-none focus:border-green-500"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-slate-700 dark:text-slate-300
                                     focus:outline-none focus:border-green-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Amount</option>
                            <option value="lowest">Lowest Amount</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredOrders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-white dark:bg-slate-800 
                                 rounded-2xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            No orders yet
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Looks like you haven't placed any orders yet. 
                            Ready to order something delicious?
                        </p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600
                                     text-white font-medium rounded-xl
                                     transition-colors duration-200
                                     shadow-lg shadow-green-500/25"
                        >
                            Browse Menu
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredOrders.map((order, index) => {
                                const StatusIcon = getStatusConfig(order.orderStatus).icon;
                                const statusConfig = getStatusConfig(order.orderStatus);
                                const isExpanded = expandedOrders.has(order._id);

                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white dark:bg-slate-800 
                                                 rounded-2xl border border-slate-200 
                                                 dark:border-slate-700 overflow-hidden
                                                 hover:border-green-200 
                                                 dark:hover:border-green-800
                                                 transition-all duration-200"
                                    >
                                        {/* Order Header */}
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                {/* Left side - Order info */}
                                                <div className="flex items-start gap-4">
                                                    <div className={`
                                                        w-12 h-12 rounded-xl flex items-center justify-center
                                                        ${statusConfig.bg} ${statusConfig.text}
                                                    `}>
                                                        <StatusIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            Order #{order.orderNumber}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                                            <span className="text-slate-500 dark:text-slate-400">
                                                                {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                                            </span>
                                                            <span className="text-slate-300 dark:text-slate-600">•</span>
                                                            <span className="text-slate-500 dark:text-slate-400">
                                                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side - Status & actions */}
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-green-500">
                                                            ${order.totalAmount.toFixed(2)}
                                                        </div>
                                                        <div className={`
                                                            inline-flex items-center gap-1 px-3 py-1
                                                            rounded-full text-sm font-medium
                                                            ${statusConfig.bg} ${statusConfig.text}
                                                        `}>
                                                            <StatusIcon className="w-4 h-4" />
                                                            {statusConfig.label}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {['pending', 'confirmed'].includes(order.orderStatus) && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="px-4 py-2 border border-red-200 
                                                                         dark:border-red-800 text-red-600 
                                                                         dark:text-red-400 rounded-lg
                                                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                                                         transition-colors text-sm font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        
                                                        {order.orderStatus === 'out_for_delivery' && (
                                                            <button
                                                                onClick={() => handleTrackOrder(order._id)}
                                                                className="px-4 py-2 bg-green-500 
                                                                         text-white rounded-lg
                                                                         hover:bg-green-600
                                                                         transition-colors text-sm font-medium"
                                                            >
                                                                Track Order
                                                            </button>
                                                        )}

                                                        {order.orderStatus === 'delivered' && (
                                                            <button
                                                                onClick={() => handleReorder(order)}
                                                                className="px-4 py-2 bg-green-500 
                                                                         text-white rounded-lg
                                                                         hover:bg-green-600
                                                                         transition-colors text-sm font-medium"
                                                            >
                                                                Reorder
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => toggleOrderDetails(order._id)}
                                                            className="p-2 border border-slate-200 
                                                                     dark:border-slate-700 rounded-lg
                                                                     hover:border-green-500 transition-colors"
                                                        >
                                                            {isExpanded ? 
                                                                <FiChevronUp className="w-5 h-5" /> : 
                                                                <FiChevronDown className="w-5 h-5" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="border-t border-slate-200 dark:border-slate-700"
                                                >
                                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Order Items */}
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                                                                    Order Items
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} 
                                                                             className="flex items-center gap-3 p-3
                                                                                      bg-white dark:bg-slate-800
                                                                                      rounded-lg border border-slate-200 
                                                                                      dark:border-slate-700">
                                                                            {item.image && (
                                                                                <img 
                                                                                    src={item.image} 
                                                                                    alt={item.name}
                                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                                />
                                                                            )}
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-slate-900 dark:text-white">
                                                                                    {item.name}
                                                                                </div>
                                                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                                                </div>
                                                                            </div>
                                                                            <div className="font-semibold text-green-500">
                                                                                ${(item.quantity * item.price).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Order Summary & Details */}
                                                            <div className="space-y-4">
                                                                {/* Delivery Address */}
                                                                <div className="p-4 bg-white dark:bg-slate-800 
                                                                            rounded-lg border border-slate-200 
                                                                            dark:border-slate-700">
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                                                        Delivery Address
                                                                    </h4>
                                                                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                        <span>{order.deliveryAddress}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Summary */}
                                                                <div className="p-4 bg-white dark:bg-slate-800 
                                                                            rounded-lg border border-slate-200 
                                                                            dark:border-slate-700">
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                                                        Payment Summary
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                                                            <span className="text-slate-900 dark:text-white">
                                                                                ${order.subtotal?.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-600 dark:text-slate-400">Delivery Fee</span>
                                                                            <span className="text-slate-900 dark:text-white">
                                                                                ${order.deliveryFee?.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-600 dark:text-slate-400">Tax</span>
                                                                            <span className="text-slate-900 dark:text-white">
                                                                                ${order.tax?.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                                                            <div className="flex justify-between font-semibold">
                                                                                <span className="text-slate-900 dark:text-white">Total</span>
                                                                                <span className="text-green-500">
                                                                                    ${order.totalAmount.toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Support Actions */}
                                                                <div className="flex gap-2">
                                                                    <button className="flex-1 p-3 border border-slate-200 
                                                                                     dark:border-slate-700 rounded-lg
                                                                                     hover:border-green-500 transition-colors
                                                                                     flex items-center justify-center gap-2
                                                                                     text-slate-600 dark:text-slate-400">
                                                                        <FiHelpCircle className="w-4 h-4" />
                                                                        <span className="text-sm">Get Help</span>
                                                                    </button>
                                                                    <button className="flex-1 p-3 border border-slate-200 
                                                                                     dark:border-slate-700 rounded-lg
                                                                                     hover:border-green-500 transition-colors
                                                                                     flex items-center justify-center gap-2
                                                                                     text-slate-600 dark:text-slate-400">
                                                                        <FiPrinter className="w-4 h-4" />
                                                                        <span className="text-sm">Print Receipt</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
