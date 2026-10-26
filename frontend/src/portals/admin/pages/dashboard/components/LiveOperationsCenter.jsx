import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiVolume2, 
  FiVolumeX, 
  FiClock, 
  FiTruck, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiUser, 
  FiPackage, 
  FiDollarSign,
  FiChevronRight,
  FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import adminOrderService from '../../../services/adminOrderService';
import { useAdminDataContext } from '../../../context/adminDataContextCore';

// Web Audio API Synthesizer Chime
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
    osc.frequency.setValueAtTime(1318.51, now + 0.24); // E6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio chime notice:', err.message);
  }
};

const LiveOperationsCenter = () => {
  const { subscribeToUpdates } = useAdminDataContext();

  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('admin_chime_enabled') !== 'false';
  });
  const [selectedDriverMap, setSelectedDriverMap] = useState({});
  const [actionLoadingMap, setActionLoadingMap] = useState({});

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('admin_chime_enabled', String(next));
      if (next) {
        playChime();
        toast('Order Chime Enabled', { icon: '🔔' });
      } else {
        toast('Order Chime Muted', { icon: '🔕' });
      }
      return next;
    });
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        adminOrderService.getOrders({ limit: 40, sortBy: 'createdAt', sortOrder: 'desc' }),
        adminOrderService.getAvailableDrivers()
      ]);

      const rawOrders = Array.isArray(ordersRes?.data?.orders)
        ? ordersRes.data.orders
        : Array.isArray(ordersRes?.orders)
        ? ordersRes.orders
        : Array.isArray(ordersRes?.data)
        ? ordersRes.data
        : [];

      setOrders(rawOrders);
      setDrivers(Array.isArray(driversRes?.data) ? driversRes.data : []);
    } catch (err) {
      console.error('Failed to load live operations data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time WebSocket listener
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((event) => {
      if (event.type === 'order_created' && event.data) {
        if (soundEnabled) {
          playChime();
        }
        toast.success(`New Order #${event.data.orderNumber} received!`, {
          icon: '🔔',
          duration: 6000
        });
        setOrders((prev) => {
          const exists = prev.some((o) => (o.id || o._id) === (event.data.id || event.data._id));
          return exists ? prev : [event.data, ...prev];
        });
      } else if (event.type === 'order_updated' && event.data) {
        setOrders((prev) =>
          prev.map((o) =>
            (o.id || o._id) === (event.data.id || event.data._id)
              ? { ...o, ...event.data }
              : o
          )
        );
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates, soundEnabled]);

  // Actions
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoadingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      await adminOrderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await loadData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAssignDriver = async (orderId) => {
    const driverId = selectedDriverMap[orderId];
    if (!driverId) {
      toast.error('Please choose a courier to assign');
      return;
    }

    setActionLoadingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      await adminOrderService.assignDriver(orderId, driverId, 'Assigned via Live Operations Board');
      toast.success('Courier assigned successfully!', { icon: '🛵' });
      await loadData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign courier');
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Group orders into lanes
  const incomingOrders = orders.filter((o) => ['pending', 'confirmed'].includes(o.orderStatus));
  const kitchenOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const transitOrders = orders.filter((o) => o.orderStatus === 'out_for_delivery');
  const deliveredOrders = orders.filter((o) => ['delivered', 'complete', 'completed'].includes(o.orderStatus)).slice(0, 8);

  const totalActive = incomingOrders.length + kitchenOrders.length + transitOrders.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      
      {/* Top Bar: Title, Live Beacon, Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Operations Command
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live WebSockets Connected
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Real-Time Order Dispatch Center
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage live orders across preparation, driver assignment, and transit in real time.
          </p>
        </div>

        {/* Audio Toggle & Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Active Orders Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>{totalActive} Active Orders</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'Order audio chime is ON (Click to mute)' : 'Order audio chime is MUTED (Click to unmute)'}
          >
            {soundEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Chime ON' : 'Chime OFF'}</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh active board"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4-Lane Real-Time Dispatch Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lane 1: Incoming & Needs Prep */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300">
                1. Incoming / New
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 tabular-nums">
              {incomingOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {incomingOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No incoming orders</p>
            ) : (
              incomingOrders.map((order) => {
                const orderId = order.id || order._id;
                const isActionLoading = actionLoadingMap[orderId];
                return (
                  <div
                    key={orderId}
                    className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="text-xs font-mono font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 flex items-center gap-1"
                      >
                        #{order.orderNumber}
                        <FiExternalLink className="w-3 h-3 opacity-50" />
                      </Link>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-2xs text-slate-500 dark:text-slate-400">
                      <div>👤 {order.customerName}</div>
                      <div className="truncate">📍 {order.deliveryStreet || order.deliveryAddress?.street}</div>
                      <div className="mt-1 text-2xs text-slate-400">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • {order.paymentMethod}
                      </div>
                    </div>

                    {/* Driver Assignment Dropdown */}
                    {!order.driverId && drivers.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <select
                          value={selectedDriverMap[orderId] || ''}
                          onChange={(e) =>
                            setSelectedDriverMap((prev) => ({ ...prev, [orderId]: e.target.value }))
                          }
                          className="w-full text-2xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="">Select Courier...</option>
                          {drivers.map((d) => (
                            <option key={d.id || d._id} value={d.id || d._id}>
                              🛵 {d.name} ({d.phone || 'Ready'})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssignDriver(orderId)}
                          disabled={isActionLoading || !selectedDriverMap[orderId]}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold transition-colors disabled:opacity-40"
                        >
                          Assign Courier
                        </button>
                      </div>
                    )}

                    {/* Quick Move to Kitchen */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(orderId, 'preparing')}
                      disabled={isActionLoading}
                      className="w-full py-1.5 rounded-lg text-2xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Send to Kitchen</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lane 2: In Kitchen Cooking */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300">
                2. In Kitchen
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 tabular-nums">
              {kitchenOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {kitchenOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No dishes currently cooking</p>
            ) : (
              kitchenOrders.map((order) => {
                const orderId = order.id || order._id;
                const isActionLoading = actionLoadingMap[orderId];
                return (
                  <div
                    key={orderId}
                    className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="text-xs font-mono font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 flex items-center gap-1"
                      >
                        #{order.orderNumber}
                        <FiExternalLink className="w-3 h-3 opacity-50" />
                      </Link>
                      <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 tabular-nums">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-2xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>🍳 Chef preparing meal</div>
                      {order.driver || order.driverId ? (
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          🛵 Assigned: {order.driver?.name || 'Courier Assigned'}
                        </div>
                      ) : (
                        <div className="text-amber-600 font-medium">⚠️ No courier assigned yet</div>
                      )}
                    </div>

                    {/* Driver Assignment Dropdown in Kitchen lane */}
                    {!order.driver && !order.driverId && drivers.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <select
                          value={selectedDriverMap[orderId] || ''}
                          onChange={(e) =>
                            setSelectedDriverMap((prev) => ({ ...prev, [orderId]: e.target.value }))
                          }
                          className="w-full text-2xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="">Select Courier...</option>
                          {drivers.map((d) => (
                            <option key={d.id || d._id} value={d.id || d._id}>
                              🛵 {d.name} ({d.phone || 'Ready'})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssignDriver(orderId)}
                          disabled={isActionLoading || !selectedDriverMap[orderId]}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold transition-colors disabled:opacity-40"
                        >
                          Assign Courier
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(orderId, 'out_for_delivery')}
                      disabled={isActionLoading}
                      className="w-full py-1.5 rounded-lg text-2xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Ready for Courier</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lane 3: Out for Delivery */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300">
                3. Out for Delivery
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 tabular-nums">
              {transitOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {transitOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No orders in transit</p>
            ) : (
              transitOrders.map((order) => {
                const orderId = order.id || order._id;
                const isActionLoading = actionLoadingMap[orderId];
                return (
                  <div
                    key={orderId}
                    className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="text-xs font-mono font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 flex items-center gap-1"
                      >
                        #{order.orderNumber}
                        <FiExternalLink className="w-3 h-3 opacity-50" />
                      </Link>
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                        GPS
                      </span>
                    </div>

                    <div className="text-2xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>🛵 Courier: {order.driver?.name || 'Assigned Driver'}</div>
                      <div className="truncate">📍 {order.deliveryStreet || order.deliveryAddress?.street}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(orderId, 'delivered')}
                      disabled={isActionLoading}
                      className="w-full py-1.5 rounded-lg text-2xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Delivered</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lane 4: Delivered Today */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300">
                4. Completed
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 tabular-nums">
              {deliveredOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {deliveredOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No completed deliveries yet</p>
            ) : (
              deliveredOrders.map((order) => {
                const orderId = order.id || order._id;
                return (
                  <div
                    key={orderId}
                    className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        #{order.orderNumber}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-2xs text-slate-400 flex items-center justify-between">
                      <span>👤 {order.customerName}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Delivered</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveOperationsCenter;
