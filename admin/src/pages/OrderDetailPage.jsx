import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiClock,
    FiMapPin,
    FiUser,
    FiDollarSign,
    FiPackage,
    FiTruck,
    FiHome,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiPrinter,
    FiMail,
    FiMessageSquare,
    FiPhone,
    FiEdit2,
    FiMoreVertical,
    FiDownload,
    FiShare2,
    FiStar,
    FiThumbsUp,
    FiThumbsDown,
    FiCalendar,
    FiCreditCard,
    FiHash,
    FiInfo
} from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAdminDataContext } from '../../contexts/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import OrderStatusUpdate from '../orders/OrderStatusUpdate';
import adminOrderService from '../../services/adminOrderService';
import adminNotificationService from '../../services/adminNotificationService';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    items: Array<{
        _id: string;
        name: string;
        quantity: number;
        price: number;
        totalPrice: number;
        specialInstructions?: string;
        image?: string;
        customizations?: Array<{
            name: string;
            option: string;
            price: number;
        }>;
    }>;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentId?: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        instructions?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    driver?: {
        _id: string;
        name: string;
        phone: string;
        avatar?: string;
        vehicle?: string;
        licensePlate?: string;
    };
    restaurant?: {
        _id: string;
        name: string;
        phone: string;
        address: string;
    };
    notes?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        note?: string;
        changedBy: {
            _id: string;
            name: string;
            role: string;
        };
    }>;
    timeline: Array<{
        event: string;
        timestamp: string;
        description: string;
        icon?: React.ReactNode;
    }>;
}

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchOrderById, updateOrder, isLoading, getError } = useAdminDataContext();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'communication'>('details');
    const [showActions, setShowActions] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationNote, setCancellationNote] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessageModal, setShowMessageModal] = useState(false);

    // Load order details
    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    // Load available drivers when modal opens
    useEffect(() => {
        if (showDriverModal) {
            loadAvailableDrivers();
        }
    }, [showDriverModal]);

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const data = await fetchOrderById(id!);
            setOrder(data);
            setOrderNotes(data?.notes || '');
        } catch (error) {
            console.error('Failed to load order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableDrivers = async () => {
        setLoadingDrivers(true);
        try {
            const response = await adminOrderService.getAvailableDrivers();
            setAvailableDrivers(response.data);
        } catch (error) {
            console.error('Failed to load drivers:', error);
            toast.error('Failed to load available drivers');
        } finally {
            setLoadingDrivers(false);
        }
    };

    const handleAssignDriver = async () => {
        if (!selectedDriver) {
            toast.error('Please select a driver');
            return;
        }

        try {
            const updated = await adminOrderService.assignDriver(order!._id, selectedDriver);
            setOrder(updated);
            setShowDriverModal(false);
            toast.success('Driver assigned successfully');
        } catch (error) {
            toast.error('Failed to assign driver');
        }
    };

    const handleSaveNotes = async () => {
        try {
            const updated = await adminOrderService.updateOrderNotes(order!._id, orderNotes);
            setOrder(updated);
            setShowNotesModal(false);
            toast.success('Notes saved');
        } catch (error) {
            toast.error('Failed to save notes');
        }
    };

    const handleCancelOrder = async () => {
        if (!cancellationNote.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            const updated = await adminOrderService.updateOrderStatus(order!._id, {
                status: 'cancelled',
                note: cancellationNote
            });
            setOrder(updated);
            setShowCancelModal(false);
            toast.success('Order cancelled');
        } catch (error) {
            toast.error('Failed to cancel order');
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            await adminNotificationService.sendCustomerMessage(order!._id, {
                type: 'sms',
                message
            });
            setMessage('');
            setShowMessageModal(false);
            toast.success('Message sent');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadInvoice = async () => {
        try {
            const blob = await adminOrderService.generateInvoice(order!._id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${order?.orderNumber}.pdf`;
            a.click();
            toast.success('Invoice downloaded');
        } catch (error) {
            toast.error('Failed to generate invoice');
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900/30 
                                      border-t-orange-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading order details...
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Order Not Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        The order you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl
                                 hover:bg-orange-600 transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
                                 transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Order #{order.orderNumber}
                            </h1>
                            <StatusBadge status={order.orderStatus} type="order" size="lg" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Action Buttons */}
                    <button
                        onClick={handlePrint}
                        className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                 transition-colors"
                        title="Print order"
                    >
                        <FiPrinter className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleDownloadInvoice}
                        className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                 transition-colors"
                        title="Download invoice"
                    >
                        <FiDownload className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors"
                        >
                            <FiMoreVertical className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                             overflow-hidden z-10"
                                >
                                    <button
                                        onClick={() => {
                                            setShowActions(false);
                                            setShowNotesModal(true);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm
                                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                                 flex items-center gap-2"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Add Notes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowActions(false);
                                            setShowMessageModal(true);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm
                                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                                 flex items-center gap-2"
                                    >
                                        <FiMessageSquare className="w-4 h-4" />
                                        Send Message
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowActions(false);
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('Link copied');
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm
                                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                                 flex items-center gap-2"
                                    >
                                        <FiShare2 className="w-4 h-4" />
                                        Share Link
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants} className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-6">
                    {[
                        { id: 'details', label: 'Order Details', icon: FiPackage },
                        { id: 'timeline', label: 'Timeline', icon: FiClock },
                        { id: 'communication', label: 'Communication', icon: FiMessageSquare }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                pb-4 px-1 border-b-2 font-medium text-sm
                                transition-colors duration-200
                                flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Order Status Update */}
                        <motion.div variants={itemVariants}>
                            <OrderStatusUpdate
                                order={order}
                                onUpdate={loadOrderDetails}
                                onNotify={(type, message) => {
                                    toast.success(message);
                                }}
                                onPrint={handlePrint}
                                onViewDetails={() => {}}
                            />
                        </motion.div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                         border border-slate-200 dark:border-slate-700"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiUser className="text-orange-500" />
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30
                                                      flex items-center justify-center text-orange-500 text-xl font-bold">
                                            {order.customer?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {order.customer?.name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Customer ID: {order.customer?._id?.slice(-6)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-3 space-y-2">
                                        <p className="flex items-center gap-2 text-sm">
                                            <FiMail className="w-4 h-4 text-slate-400" />
                                            <a href={`mailto:${order.customer?.email}`} className="text-slate-600 dark:text-slate-400 hover:text-orange-500">
                                                {order.customer?.email}
                                            </a>
                                        </p>
                                        <p className="flex items-center gap-2 text-sm">
                                            <FiPhone className="w-4 h-4 text-slate-400" />
                                            <a href={`tel:${order.customer?.phone}`} className="text-slate-600 dark:text-slate-400 hover:text-orange-500">
                                                {order.customer?.phone}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Delivery Address */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                         border border-slate-200 dark:border-slate-700"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiMapPin className="text-orange-500" />
                                    Delivery Address
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {order.deliveryAddress?.street}<br />
                                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
                                    </p>
                                    {order.deliveryAddress?.instructions && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                            <p className="text-sm text-slate-500">Delivery Instructions:</p>
                                            <p className="text-slate-700 dark:text-slate-300">
                                                {order.deliveryAddress.instructions}
                                            </p>
                                        </div>
                                    )}
                                    {order.deliveryAddress?.coordinates && (
                                        <button
                                            onClick={() => window.open(`https://maps.google.com/?q=${order.deliveryAddress.coordinates?.lat},${order.deliveryAddress.coordinates?.lng}`)}
                                            className="text-sm text-orange-500 hover:text-orange-600"
                                        >
                                            View on Maps
                                        </button>
                                    )}
                                </div>
                            </motion.div>

                            {/* Payment Information */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                         border border-slate-200 dark:border-slate-700"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiDollarSign className="text-orange-500" />
                                    Payment Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Method</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {order.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Status</span>
                                        <StatusBadge status={order.paymentStatus} type="payment" />
                                    </div>
                                    {order.paymentId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Payment ID</span>
                                            <span className="text-sm font-mono">{order.paymentId.slice(-8)}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Driver Information */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                         border border-slate-200 dark:border-slate-700"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiTruck className="text-orange-500" />
                                    Driver Information
                                </h3>
                                {order.driver ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30
                                                          flex items-center justify-center text-purple-500">
                                                {order.driver.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {order.driver.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {order.driver.vehicle} • {order.driver.licensePlate}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="flex items-center gap-2 text-sm">
                                            <FiPhone className="w-4 h-4 text-slate-400" />
                                            <a href={`tel:${order.driver.phone}`} className="text-slate-600 dark:text-slate-400 hover:text-orange-500">
                                                {order.driver.phone}
                                            </a>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-500 mb-3">No driver assigned yet</p>
                                        <button
                                            onClick={() => setShowDriverModal(true)}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg
                                                     hover:bg-orange-600 transition-colors text-sm"
                                        >
                                            Assign Driver
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Order Items */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                     border border-slate-200 dark:border-slate-700"
                        >
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Order Items
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="pb-3 text-left text-sm font-medium text-slate-500">Item</th>
                                            <th className="pb-3 text-center text-sm font-medium text-slate-500">Quantity</th>
                                            <th className="pb-3 text-right text-sm font-medium text-slate-500">Price</th>
                                            <th className="pb-3 text-right text-sm font-medium text-slate-500">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {order.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {item.name}
                                                            </p>
                                                            {item.specialInstructions && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    Note: {item.specialInstructions}
                                                                </p>
                                                            )}
                                                            {item.customizations?.map((custom, idx) => (
                                                                <p key={idx} className="text-xs text-slate-400">
                                                                    {custom.name}: {custom.option} (+${custom.price})
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center text-slate-600 dark:text-slate-400">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                                                    ${item.price?.toFixed(2)}
                                                </td>
                                                <td className="py-4 text-right font-medium text-slate-900 dark:text-white">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <td colSpan={3} className="pt-4 text-right text-slate-600 dark:text-slate-400">
                                                Subtotal
                                            </td>
                                            <td className="pt-4 text-right font-medium text-slate-900 dark:text-white">
                                                ${order.subtotal?.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="pt-2 text-right text-slate-600 dark:text-slate-400">
                                                Delivery Fee
                                            </td>
                                            <td className="pt-2 text-right font-medium text-slate-900 dark:text-white">
                                                ${order.deliveryFee?.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="pt-2 text-right text-slate-600 dark:text-slate-400">
                                                Tax
                                            </td>
                                            <td className="pt-2 text-right font-medium text-slate-900 dark:text-white">
                                                ${order.tax?.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr className="text-lg">
                                            <td colSpan={3} className="pt-4 text-right font-bold text-slate-900 dark:text-white">
                                                Total
                                            </td>
                                            <td className="pt-4 text-right font-bold text-orange-500">
                                                ${order.totalAmount?.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                 border border-slate-200 dark:border-slate-700"
                    >
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Order Timeline
                        </h2>
                        <div className="space-y-6">
                            {order.statusHistory?.map((event, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="relative">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            ${index === 0 ? 'bg-orange-500' : 'bg-slate-100 dark:bg-slate-700'}
                                        `}>
                                            {index === 0 ? (
                                                <FiCheckCircle className="w-5 h-5 text-white" />
                                            ) : (
                                                <FiClock className="w-5 h-5 text-slate-500" />
                                            )}
                                        </div>
                                        {index < order.statusHistory.length - 1 && (
                                            <div className="absolute top-10 left-1/2 w-0.5 h-12
                                                          bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Status changed to {event.status.replace(/_/g, ' ')}
                                            </h3>
                                            <span className="text-sm text-slate-500">
                                                {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        {event.note && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Note: {event.note}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">
                                            By: {event.changedBy?.name} ({event.changedBy?.role})
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Communication Tab */}
                {activeTab === 'communication' && (
                    <motion.div
                        key="communication"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                      border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Communication Log
                            </h2>
                            
                            {/* Message Input */}
                            <div className="flex gap-3 mb-6">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message to send to customer..."
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900
                                             border border-slate-200 dark:border-slate-700
                                             rounded-xl text-sm
                                             focus:outline-none focus:border-orange-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-xl
                                             hover:bg-orange-600 transition-colors
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => {
                                        setMessage("Your order is being prepared and will be ready soon!");
                                    }}
                                    className="p-4 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:border-orange-500
                                             transition-colors text-left"
                                >
                                    <FiClock className="w-5 h-5 text-orange-500 mb-2" />
                                    <p className="text-sm font-medium">Preparing</p>
                                    <p className="text-xs text-slate-500">Quick status update</p>
                                </button>
                                <button
                                    onClick={() => {
                                        setMessage("Your order is out for delivery! Our driver is on the way.");
                                    }}
                                    className="p-4 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:border-orange-500
                                             transition-colors text-left"
                                >
                                    <FiTruck className="w-5 h-5 text-orange-500 mb-2" />
                                    <p className="text-sm font-medium">Out for Delivery</p>
                                    <p className="text-xs text-slate-500">Driver on the way</p>
                                </button>
                                <button
                                    onClick={() => {
                                        setMessage("Your order has been delivered! Enjoy your meal!");
                                    }}
                                    className="p-4 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:border-orange-500
                                             transition-colors text-left"
                                >
                                    <FiCheckCircle className="w-5 h-5 text-orange-500 mb-2" />
                                    <p className="text-sm font-medium">Delivered</p>
                                    <p className="text-xs text-slate-500">Order completed</p>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Driver Assignment Modal */}
            <AnimatePresence>
                {showDriverModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDriverModal(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Assign Driver
                            </h3>
                            
                            <select
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                                className="w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-900
                                         border border-slate-200 dark:border-slate-700
                                         rounded-xl text-sm
                                         focus:outline-none focus:border-orange-500"
                            >
                                <option value="">Select a driver</option>
                                {availableDrivers.map((driver) => (
                                    <option key={driver._id} value={driver._id}>
                                        {driver.name} - {driver.phone} ({driver.vehicle})
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDriverModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignDriver}
                                    disabled={loadingDrivers}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white
                                             rounded-lg text-sm hover:bg-orange-600
                                             transition-colors disabled:opacity-50"
                                >
                                    {loadingDrivers ? 'Loading...' : 'Assign'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Modal */}
            <AnimatePresence>
                {showNotesModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Order Notes
                            </h3>
                            
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                rows={4}
                                placeholder="Add internal notes about this order..."
                                className="w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-900
                                         border border-slate-200 dark:border-slate-700
                                         rounded-xl text-sm
                                         focus:outline-none focus:border-orange-500"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white
                                             rounded-lg text-sm hover:bg-orange-600
                                             transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCancelModal(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30
                                              rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Cancel Order
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                </p>
                                
                                <textarea
                                    value={cancellationNote}
                                    onChange={(e) => setCancellationNote(e.target.value)}
                                    rows={3}
                                    placeholder="Please provide a reason for cancellation..."
                                    className="w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-900
                                             border border-slate-200 dark:border-slate-700
                                             rounded-xl text-sm
                                             focus:outline-none focus:border-orange-500"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
                                    >
                                        Keep Order
                                    </button>
                                    <button
                                        onClick={handleCancelOrder}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg text-sm hover:bg-red-600
                                                 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Modal */}
            <AnimatePresence>
                {showMessageModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMessageModal(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Send Message to Customer
                            </h3>
                            
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Type your message..."
                                className="w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-900
                                         border border-slate-200 dark:border-slate-700
                                         rounded-xl text-sm
                                         focus:outline-none focus:border-orange-500"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white
                                             rounded-lg text-sm hover:bg-orange-600
                                             transition-colors disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrderDetailPage;