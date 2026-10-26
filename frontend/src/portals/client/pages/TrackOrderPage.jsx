import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    FiArrowLeft, 
    FiCheckCircle, 
    FiClock, 
    FiTruck, 
    FiPackage, 
    FiMapPin,
    FiRefreshCw
} from 'react-icons/fi';
import orderService from '../services/order.service';
import Loader from '../components/ui/Loader';
import OrderMessageChat from './orders/components/OrderMessageChat';
import { useOrderSocket } from '../../../shared/socket';
import LiveDeliveryMap from '../components/tracking/LiveDeliveryMap';

const TRACKING_STEPS = [
    { key: 'confirmed', label: 'Order Confirmed', description: 'Restaurant received your order', icon: FiCheckCircle },
    { key: 'preparing', label: 'Preparing Food', description: 'Chef is cooking your fresh meal', icon: FiClock },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Driver is on the way to you', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', description: 'Enjoy your delicious meal!', icon: FiPackage },
];

const getStepIndex = (status) => {
    switch (status) {
        case 'pending':
            return 0;
        case 'confirmed':
            return 0;
        case 'preparing':
            return 1;
        case 'out_for_delivery':
            return 2;
        case 'delivered':
        case 'complete':
        case 'completed':
            return 3;
        default:
            return 0;
    }
};

const TrackOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Messages with driver
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Real-time driver GPS coordinates
    const [driverLocation, setDriverLocation] = useState(null);

    // Real-time WebSocket connection
    useOrderSocket(id, {
        onOrderUpdated: (updatedOrder) => {
            if (updatedOrder && (updatedOrder.id === id || updatedOrder._id === id)) {
                setOrder((prev) => {
                    if (prev && prev.orderStatus !== updatedOrder.orderStatus) {
                        const statusFormatted = updatedOrder.orderStatus.replace(/_/g, ' ').toUpperCase();
                        toast.success(`Order update: ${statusFormatted}`, {
                            icon: '🔔',
                            duration: 4000
                        });
                    }
                    return updatedOrder;
                });
            }
        },
        onNewMessage: (newMsg) => {
            if (!newMsg) return;
            setMessages((prev) => {
                const exists = prev.some((m) => (m._id || m.id) === (newMsg._id || newMsg.id));
                if (exists) return prev;
                if (newMsg.senderRole === 'driver') {
                    toast(`Driver: ${newMsg.message}`, { icon: '💬' });
                }
                return [...prev, newMsg];
            });
        },
        onDriverLocation: (coords) => {
            if (coords) {
                setDriverLocation(coords);
            }
        }
    });

    const loadOrder = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        try {
            const response = await orderService.getOrderById(id);
            const data = response?.data || response;
            setOrder(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to load order details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    const loadMessages = useCallback(async () => {
        try {
            const res = await orderService.getOrderMessages(id);
            setMessages(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load order messages:', err);
        }
    }, [id]);

    useEffect(() => {
        loadOrder();
        loadMessages();
    }, [loadOrder, loadMessages]);

    // Fallback heartbeat poll every 30s
    useEffect(() => {
        if (!order) return;
        const terminalStatuses = ['delivered', 'complete', 'completed', 'cancelled', 'rejected'];
        if (terminalStatuses.includes(order.orderStatus)) return;

        const interval = setInterval(() => {
            loadOrder(true);
            loadMessages();
        }, 30000);

        return () => clearInterval(interval);
    }, [order, loadOrder, loadMessages]);

    const handleSendMessage = async (orderId) => {
        if (!messageInput.trim()) return;
        const text = messageInput.trim();
        setIsSendingMessage(true);
        try {
            const res = await orderService.sendOrderMessage(orderId, text);
            setMessageInput('');
            if (res?.data) {
                setMessages((prev) => {
                    const exists = prev.some((m) => (m._id || m.id) === (res.data._id || res.data.id));
                    return exists ? prev : [...prev, res.data];
                });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">📍</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Order Not Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {error || "We couldn't find the tracking information for this order."}
                    </p>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const currentStepIndex = getStepIndex(order.orderStatus);
    const isCancelled = ['cancelled', 'canceled', 'rejected'].includes(order.orderStatus);

    const formattedAddress = typeof order.deliveryAddress === 'object' && order.deliveryAddress !== null
        ? [order.deliveryAddress.street, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.zipCode]
              .filter(Boolean)
              .join(', ') || [order.deliveryStreet, order.deliveryCity, order.deliveryState, order.deliveryZipCode].filter(Boolean).join(', ') || 'Standard Delivery Address'
        : (order.deliveryAddress || [order.deliveryStreet, order.deliveryCity, order.deliveryState, order.deliveryZipCode].filter(Boolean).join(', ') || 'Standard Delivery Address');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span>Back to Orders</span>
                    </button>
                    <button
                        onClick={() => {
                            loadOrder(true);
                            loadMessages();
                        }}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                    >
                        <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Tracking Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs uppercase font-semibold tracking-wider text-green-500">
                                    Live Order Tracking
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Real-Time Active
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                                Order #{order.orderNumber || order.id || order._id}
                            </h1>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Total Amount</span>
                            <div className="text-2xl font-bold tracking-tight text-green-500 tabular-nums">
                                ${Number(order.totalAmount || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Cancelled Banner */}
                    {isCancelled ? (
                        <div className="my-8 p-6 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/40 text-center">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                                Order Cancelled
                            </h3>
                            <p className="text-sm text-red-700/80 dark:text-red-300/80">
                                This order was cancelled. If you believe this is an error, please reach out to customer support.
                            </p>
                        </div>
                    ) : (
                        /* Progress Pipeline */
                        <div className="py-8">
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                                    />
                                </div>

                                {/* Step Icons */}
                                <div className="relative z-10 grid grid-cols-4 gap-2">
                                    {TRACKING_STEPS.map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = idx <= currentStepIndex;
                                        const isCurrent = idx === currentStepIndex;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center text-center">
                                                <motion.div
                                                    initial={false}
                                                    animate={{
                                                        scale: isCurrent ? 1.15 : 1,
                                                    }}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                                                        isCompleted
                                                            ? 'bg-green-500 text-white shadow-green-500/20'
                                                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    <StepIcon className="w-5 h-5" />
                                                </motion.div>
                                                <h4 className={`text-xs sm:text-sm font-semibold mt-3 ${
                                                    isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                                }`}>
                                                    {step.label}
                                                </h4>
                                                <p className="hidden sm:block text-xs text-muted-foreground mt-1 max-w-[120px]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Interactive Live GPS Delivery Map */}
                {!isCancelled && (
                    <div className="mb-8">
                        <LiveDeliveryMap order={order} driverLocation={driverLocation} />
                    </div>
                )}

                {/* Details Grid: Left: Items & Delivery Address, Right: Driver Chat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery & Items Summary */}
                    <div className="space-y-6">
                        {/* Assigned Driver Card (if assigned) */}
                        {order.driver && (
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                        Assigned Courier
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
                                        <FiTruck className="w-3.5 h-3.5" />
                                        On Delivery Duty
                                    </span>
                                </div>
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        {order.driver.name?.charAt(0) || 'D'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground text-base truncate">
                                            {order.driver.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {order.driver.phone || order.driver.email}
                                        </p>
                                    </div>
                                    {driverLocation && (
                                        <div className="text-right">
                                            <span className="text-2xs uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                                GPS Streaming
                                            </span>
                                            <span className="text-2xs font-mono tabular-nums text-muted-foreground">
                                                {driverLocation.latitude?.toFixed(4)}, {driverLocation.longitude?.toFixed(4)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Verified Proof of Delivery Photo Card */}
                        {order.driverWorkflow?.proofOfDelivery?.imageUrl && (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        <FiCheckCircle className="w-4 h-4" />
                                        Proof of Delivery Photo
                                    </h3>
                                    <span className="text-2xs tabular-nums text-muted-foreground">
                                        {order.driverWorkflow.proofOfDelivery.capturedAt
                                            ? new Date(order.driverWorkflow.proofOfDelivery.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : 'Delivered'}
                                    </span>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 max-h-56 bg-slate-950">
                                    <img
                                        src={order.driverWorkflow.proofOfDelivery.imageUrl}
                                        alt="Doorstep Proof of Delivery"
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                {order.driverWorkflow.proofOfDelivery.notes && (
                                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                                        &ldquo;{order.driverWorkflow.proofOfDelivery.notes}&rdquo;
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Delivery Address Card */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                Delivery Address
                            </h3>
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <FiMapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {formattedAddress}
                                    </p>
                                    {(order.deliveryAddress?.instructions || order.deliveryInstructions) && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                                            Instructions: {order.deliveryAddress?.instructions || order.deliveryInstructions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Card */}
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                Items Ordered
                            </h3>
                            <div className="space-y-3">
                                {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                            <span className="text-slate-500 ml-2">× {item.quantity}</span>
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Driver Messaging Section */}
                    <div>
                        <OrderMessageChat
                            orderId={order._id || order.id}
                            messages={messages}
                            messageInput={messageInput}
                            onMessageInputChange={(_, val) => setMessageInput(val)}
                            onSendMessage={handleSendMessage}
                            isSending={isSendingMessage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;
