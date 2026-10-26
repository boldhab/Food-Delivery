import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiClock,
  FiPackage,
  FiPrinter,
  FiMessageSquare,
  FiShare2,
  FiAlertCircle
} from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAdminDataContext } from '../context/adminDataContextCore';
import StatusBadge from '../components/common/StatusBadge';
import OrderStatusUpdate from '../components/orders/OrderStatusUpdate';
import adminOrderService from '../services/adminOrderService';

// Subcomponents
import CustomerAndDeliveryCard from './orders/detail/CustomerAndDeliveryCard';
import PaymentAndDriverCard from './orders/detail/PaymentAndDriverCard';
import OrderItemsTable from './orders/detail/OrderItemsTable';
import OrderTimelineTab from './orders/detail/OrderTimelineTab';
import OrderCommunicationTab from './orders/detail/OrderCommunicationTab';
import AssignDriverModal from './orders/detail/AssignDriverModal';

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

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/admin/orders';
  const { fetchOrderById } = useAdminDataContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationNote, setCancellationNote] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [message, setMessage] = useState('');

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadAvailableDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const drivers = await adminOrderService.getAvailableDrivers();
      setAvailableDrivers(drivers || []);
    } catch (error) {
      toast.error('Failed to load available drivers');
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    if (showDriverModal) {
      loadAvailableDrivers();
    }
  }, [showDriverModal]);

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    try {
      await adminOrderService.assignDriver(order.id || order._id, selectedDriver);
      toast.success('Driver assigned successfully');
      setShowDriverModal(false);
      loadOrderDetails();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success('Notification sent to customer');
    setMessage('');
  };

  const handleCancelOrder = async () => {
    try {
      await adminOrderService.updateOrderStatus(order.id || order._id, 'cancelled', cancellationNote);
      toast.success('Order cancelled');
      setShowCancelModal(false);
      loadOrderDetails();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-200 dark:border-orange-900/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
          <button
            onClick={() => navigate(returnTo)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold"
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
      className="space-y-6"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(returnTo)}
            className="h-9 w-9 rounded-xl flex items-center justify-center bg-card border border-border text-foreground hover:border-primary/50 transition-colors cursor-pointer"
            title="Go back"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono">
                #{order.orderNumber || (order.id || order._id)?.slice(-8)}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'Recent'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="h-9 px-3.5 bg-card border border-border rounded-xl text-foreground hover:border-primary/50 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
          >
            <FiPrinter className="w-4 h-4 text-muted-foreground" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="h-9 px-3.5 border border-rose-200 dark:border-rose-900/40 text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Cancel Order
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-6">
          {[
            { id: 'details', label: 'Order Details', icon: FiPackage },
            { id: 'timeline', label: 'Timeline & History', icon: FiClock },
            { id: 'communication', label: 'Customer Messaging', icon: FiMessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Status Update Control */}
            <motion.div variants={itemVariants}>
              <OrderStatusUpdate
                order={order}
                onUpdate={loadOrderDetails}
                onNotify={(_, msg) => toast.success(msg)}
                onPrint={handlePrint}
                onViewDetails={() => {}}
              />
            </motion.div>

            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerAndDeliveryCard order={order} itemVariants={itemVariants} />
              <PaymentAndDriverCard
                order={order}
                setShowDriverModal={setShowDriverModal}
                itemVariants={itemVariants}
              />
            </div>

            {/* Items Table */}
            <OrderItemsTable order={order} itemVariants={itemVariants} />
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <OrderTimelineTab order={order} itemVariants={itemVariants} />
        )}

        {activeTab === 'communication' && (
          <OrderCommunicationTab
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
          />
        )}
      </AnimatePresence>

      {/* Driver Modal */}
      <AssignDriverModal
        showDriverModal={showDriverModal}
        setShowDriverModal={setShowDriverModal}
        availableDrivers={availableDrivers}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
        handleAssignDriver={handleAssignDriver}
        loadingDrivers={loadingDrivers}
      />

      {/* Cancel Order Modal */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Cancel Order?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Please provide a reason for cancelling this order.
                </p>
                <textarea
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  rows={3}
                  placeholder="Reason for cancellation..."
                  className="w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderDetailPage;
