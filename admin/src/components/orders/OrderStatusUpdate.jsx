import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiPackage,
    FiHome,
    FiAlertCircle,
    FiInfo,
    FiSend,
    FiPrinter,
    FiMail,
    FiMessageSquare,
    FiEdit2,
    FiSave,
    FiRefreshCw,
    FiEye,
    FiChevronDown,
    FiChevronUp,
    FiCalendar,
    FiUser,
    FiMapPin,
    FiDollarSign,
    FiCreditCard,
    FiPhone,
    FiMail
} from 'react-icons/fi';
import adminOrderService from '../../services/adminOrderService';
import StatusBadge from '../common/StatusBadge';
import { toast } from 'react-hot-toast';
const OrderStatusUpdate = ({
    order,
    onUpdate,
    onNotify,
    onPrint,
    onViewDetails
}) => {
    const [status, setStatus] = useState(order?.orderStatus || 'pending');
    const [submitting, setSubmitting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [statusHistory, setStatusHistory] = useState([]);
    const [notes, setNotes] = useState(order?.notes || '');
    const [showNotes, setShowNotes] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState(order?.estimatedDeliveryTime || '');
    const [showDriverAssignment, setShowDriverAssignment] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(order?.driver?._id || '');
    const [loadingDrivers, setLoadingDrivers] = useState(false);

    // Status configuration
    const statusConfig, { 
        label= {
        pending,
            color,
            icon,
            nextStatus, 'cancelled']
        },
        confirmed,
            color,
            icon,
            nextStatus, 'cancelled']
        },
        preparing,
            color,
            icon,
            nextStatus, 'cancelled']
        },
        out_for_delivery,
            color,
            icon,
            nextStatus,
            requiresDriver,
        delivered,
            color,
            icon,
            nextStatus,
        cancelled,
            color,
            icon,
            nextStatus,
            requiresNote) => {
        loadStatusHistory();
    }, [order._id]);

    // Load available drivers when needed
    useEffect(() => {
        if (showDriverAssignment && status === 'out_for_delivery') {
            loadAvailableDrivers();
        }
    }, [showDriverAssignment, status]);

    const loadStatusHistory = async () => {
        try {
            const history = await adminOrderService.getOrderStatusHistory(order._id);
            setStatusHistory(history);
        } catch (error) {
            console.error('Failed to load status history, error);
        }
    };

    const loadAvailableDrivers = async () => {
        setLoadingDrivers(true);
        try {
            const drivers = await adminOrderService.getAvailableDrivers();
            setAvailableDrivers(drivers);
        } catch (error) {
            console.error('Failed to load drivers, error);
            toast.error('Could not load available drivers');
        } finally {
            setLoadingDrivers(false);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        // Show driver assignment if needed
        if (statusConfig[newStatus]?.requiresDriver) {
            setShowDriverAssignment(true);
        }

        // Show notes input if needed
        if (statusConfig[newStatus]?.requiresNote) {
            setShowNotes(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!order?._id) {
            toast.error('Order ID is missing');
            return;
        }

        // Validate driver assignment
        if (statusConfig[status]?.requiresDriver && !selectedDriver) {
            toast.error('Please assign a driver');
            return;
        }

        // Validate cancellation note
        if (status === 'cancelled' && !notes.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setSubmitting(true);
        
        try {
            const updateData = { status };
            
            if (selectedDriver) {
                updateData.driverId = selectedDriver;
            }
            
            if (notes) {
                updateData.notes = notes;
            }
            
            if (estimatedTime && status === 'out_for_delivery') {
                updateData.estimatedDeliveryTime = estimatedTime;
            }

            await adminOrderService.updateOrderStatus(order._id, updateData);
            
            toast.success(`Order status updated to ${statusConfig[status].label}`);
            
            // Send notifications based on status
            if (status === 'out_for_delivery') {
                onNotify?.('driver_assigned', 'Driver has been assigned to order');
                // Send SMS to customer
                await adminOrderService.sendDeliveryNotification(order._id, {
                    type,
                    message);
            } else if (status === 'delivered') {
                onNotify?.('order_delivered', 'Order has been delivered');
            } else if (status === 'cancelled') {
                onNotify?.('order_cancelled', `Order cancelled);
            }

            await onUpdate?.();
            await loadStatusHistory();

            // Reset states
            setShowDriverAssignment(false);
            setShowNotes(false);
            
        } catch (error) {
            console.error('Failed to update order status, error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendNotification = async (type) => {
        try {
            await adminOrderService.sendCustomerNotification(order._id, type);
            toast.success(`${type.toUpperCase()} notification sent`);
        } catch (error) {
            toast.error(`Failed to send ${type} notification`);
        }
    };

    const getStatusTimeline = () => {
        const timeline = [];
        let currentStatus = status;

        while (currentStatus) {
            const config = statusConfig[currentStatus];
            if (config) {
                timeline.unshift({
                    status,
                    label,
                    icon,
                    color);
            }
            currentStatus = statusHistory.find(s => s.to === currentStatus)?.from;
        }

        return timeline;
    };

    return (
        <div className="bg-white dark="p-6 border-b border-slate-200 dark="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark="text-sm text-slate-500 dark="flex items-center gap-2">
                        <button
                            onClick={onViewDetails}
                            className="p-2 text-slate-500 hover="View order details"
                        >
                            <FiEye className="w-5 h-5" />
                        </button>
                        {onPrint && (
                            <button
                                onClick={onPrint}
                                className="p-2 text-slate-500 hover="Print order"
                            >
                                <FiPrinter className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Current Status */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark={order?.orderStatus} 
                            type="order" 
                            variant="pill"
                            showIcon
                        />
                    </div>
                    
                    {/* Progress Timeline */}
                    <div className="relative mt-4">
                        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 dark="relative flex justify-between">
                            {getStatusTimeline().map((step, index) => {
                                const isCompleted = statusHistory.some(
                                    h => h.to === step.status && h.completedAt
                                );
                                const isCurrent = step.status === status;

                                return (
                                    <div key={step.status} className="flex flex-col items-center">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center
                                            ${isCompleted || isCurrent
                                                ? `bg-${step.color}-100 dark={`
                                                w-4 h-4
                                                ${isCompleted || isCurrent
                                                    ? `text-${step.color}-500`
                                                    : 'text-slate-400'
                                                }
                                            `} />
                                        </div>
                                        <span className="text-xs mt-2 text-slate-600 dark);
                            })}
                        </div>
                    </div>
                </div>

                {/* Status Update Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark={status}
                            onChange={handleStatusChange}
                            disabled={submitting}
                            className="w-full px-4 py-3 bg-slate-50 dark).map(([value, config]) => (
                                <option key={value} value={value}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Driver Assignment */}
                    <AnimatePresence>
                        {showDriverAssignment && (
                            <motion.div
                                initial={{ height, opacity={{ height, opacity={{ height, opacity={{ duration="overflow-hidden"
                            >
                                <label className="block text-sm font-medium text-slate-700 dark={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    disabled={loadingDrivers}
                                    className="w-full px-4 py-3 bg-slate-50 dark="">Select a driver</option>
                                    {availableDrivers.map((driver) => (
                                        <option key={driver._id} value={driver._id}>
                                            {driver.name} - {driver.phone}
                                        </option>
                                    ))}
                                </select>
                                {loadingDrivers && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        Loading available drivers...
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Estimated Delivery Time */}
                    <AnimatePresence>
                        {status === 'out_for_delivery' && (
                            <motion.div
                                initial={{ height, opacity={{ height, opacity={{ height, opacity={{ duration="overflow-hidden"
                            >
                                <label className="block text-sm font-medium text-slate-700 dark="datetime-local"
                                    value={estimatedTime}
                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark)}
                    </AnimatePresence>

                    {/* Notes/Reason */}
                    <AnimatePresence>
                        {showNotes && (
                            <motion.div
                                initial={{ height, opacity={{ height, opacity={{ height, opacity={{ duration="overflow-hidden"
                            >
                                <label className="block text-sm font-medium text-slate-700 dark=== 'cancelled' ? 'Cancellation Reason *' : 'Additional Notes'}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder={status === 'cancelled' 
                                        ? 'Please provide a reason for cancellation...'
                                        : 'Add any notes about this order...'
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark)}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-orange-500 hover="w-5 h-5 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-5 h-5" />
                                    <span>Update Status</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-4 py-3 border border-slate-200 dark={{ height, opacity={{ height, opacity={{ height, opacity={{ duration="overflow-hidden mt-4"
                        >
                            <div className="pt-4 border-t border-slate-200 dark="text-sm font-semibold text-slate-900 dark="space-y-3">
                                    {statusHistory.map((entry, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark="w-3 h-3 text-slate-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-slate-900 dark="text-xs text-slate-500">
                                                        {new Date(entry.changedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {entry.note && (
                                                    <p className="text-xs text-slate-600 dark)}
                                                <p className="text-xs text-slate-500 mt-1">
                                                    By))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 bg-slate-50 dark="flex items-center gap-2">
                    <button
                        onClick={() => handleSendNotification('sms')}
                        className="p-2 text-slate-500 hover="Send SMS to customer"
                    >
                        <FiPhone className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleSendNotification('email')}
                        className="p-2 text-slate-500 hover:text-orange-500
                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                 rounded-lg transition-colors"
                        title="Send email to customer"
                    >
                        <FiMailIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FiClock className="w-3 h-3" />
                    <span>Last updated: {new Date().toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusUpdate;