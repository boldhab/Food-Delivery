import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
    FiChevronDown, 
    FiChevronUp, 
    FiMapPin, 
    FiHelpCircle, 
    FiPrinter 
} from 'react-icons/fi';
import OrderMessageChat from './OrderMessageChat';

const OrderItemCard = ({
    order,
    index,
    statusConfig,
    isExpanded,
    onToggleDetails,
    onCancelOrder,
    onTrackOrder,
    onReorder,
    orderMessages,
    messageInput,
    onMessageInputChange,
    onSendMessage,
    isSendingMessage
}) => {
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-green-200 dark:hover:border-green-800 transition-all duration-200"
        >
            {/* Order Header */}
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left side - Order info */}
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Order #{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="text-slate-500 dark:text-slate-400">
                                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-slate-500 dark:text-slate-400">
                                    {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Status & actions */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-500">
                                ${Number(order.totalAmount || 0).toFixed(2)}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {['pending', 'confirmed'].includes(order.orderStatus) && (
                                <button
                                    onClick={() => onCancelOrder(order._id)}
                                    className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                            
                            {order.orderStatus === 'out_for_delivery' && (
                                <button
                                    onClick={() => onTrackOrder(order._id || order.id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                >
                                    Track Order
                                </button>
                            )}

                            {order.orderStatus === 'delivered' && (
                                <button
                                    onClick={() => onReorder(order)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                >
                                    Reorder
                                </button>
                            )}

                            <button
                                onClick={() => onToggleDetails(order._id)}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 transition-colors"
                                title={isExpanded ? "Collapse details" : "Expand details"}
                            >
                                {isExpanded ? (
                                    <FiChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                ) : (
                                    <FiChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details Drawer */}
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
                                {/* Order Items Column */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                                        Order Items
                                    </h4>
                                    <div className="space-y-3">
                                        {(order.items || []).map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                            >
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
                                                        Qty: {item.quantity} × ${Number(item.price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-green-500">
                                                    ${(Number(item.quantity || 1) * Number(item.price || 0)).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary, Address & Support Column */}
                                <div className="space-y-4">
                                    {/* Delivery Address */}
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                            Delivery Address
                                        </h4>
                                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                                            <div>
                                                <span>
                                                    {typeof order.deliveryAddress === 'object' && order.deliveryAddress !== null
                                                        ? [order.deliveryAddress.street, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.zipCode]
                                                              .filter(Boolean)
                                                              .join(', ') || [order.deliveryStreet, order.deliveryCity, order.deliveryState, order.deliveryZipCode].filter(Boolean).join(', ') || 'Standard Delivery Address'
                                                        : (order.deliveryAddress || [order.deliveryStreet, order.deliveryCity, order.deliveryState, order.deliveryZipCode].filter(Boolean).join(', ') || 'Standard Delivery Address')}
                                                </span>
                                                {(order.deliveryAddress?.instructions || order.deliveryInstructions) && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                                                        Note: {order.deliveryAddress?.instructions || order.deliveryInstructions}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                            Payment Summary
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    ${Number(order.subtotal || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Delivery Fee</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    ${Number(order.deliveryFee || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    ${Number(order.tax || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                                <div className="flex justify-between font-semibold">
                                                    <span className="text-slate-900 dark:text-white">Total</span>
                                                    <span className="text-green-500">
                                                        ${Number(order.totalAmount || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Support Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                            <FiHelpCircle className="w-4 h-4" />
                                            <span>Get Help</span>
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-sm"
                                        >
                                            <FiPrinter className="w-4 h-4" />
                                            <span>Print Receipt</span>
                                        </button>
                                    </div>

                                    {/* Driver Communication Chat */}
                                    <OrderMessageChat
                                        orderId={order._id}
                                        messages={orderMessages[order._id]}
                                        messageInput={messageInput}
                                        onMessageInputChange={onMessageInputChange}
                                        onSendMessage={onSendMessage}
                                        isSending={isSendingMessage}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrderItemCard;
