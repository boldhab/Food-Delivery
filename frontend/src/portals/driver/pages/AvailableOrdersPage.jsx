import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiRadio, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiChevronRight,
  FiVolume2,
  FiVolumeX
} from "react-icons/fi";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";
import TimedOrderOfferModal from "../components/TimedOrderOfferModal";

// Audio chime for new incoming order dispatch
const playDispatchChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.15); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (err) {
    // audio not allowed before user gesture
  }
};

// Mobile courier dispatch haptic pattern
const triggerDispatchHaptic = () => {
  try {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([250, 100, 250, 100, 400]);
    }
  } catch (_e) {
    // Vibration API may not be supported or blocked
  }
};

const AvailableOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeOfferModalOrder, setActiveOfferModalOrder] = useState(null);
  const previousIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await driverOrderService.getAvailableOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      const currentIds = new Set(list.map((o) => o._id || o.id));
      if (!initialLoadRef.current && soundEnabled) {
        const newOrder = list.find((o) => !previousIdsRef.current.has(o._id || o.id));
        if (newOrder) {
          playDispatchChime();
          triggerDispatchHaptic();
          toast("🔔 New delivery order available!", { icon: "⚡" });
          setActiveOfferModalOrder(newOrder);
        }
      }
      previousIdsRef.current = currentIds;
      initialLoadRef.current = false;
    } catch (error) {
      if (!isSilent) {
        toast.error(error?.response?.data?.message || "Failed to load available orders");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleAccept = async (e, id) => {
    e.stopPropagation();
    setActionId(id);
    try {
      await driverOrderService.acceptOrder(id, "Accepted by driver");
      toast.success("Order accepted! Delivery assigned to you.", { icon: "🚀" });
      navigate(`/driver/deliveries/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not accept order");
      setActionId(null);
    }
  };

  const handleDecline = async (e, id) => {
    e.stopPropagation();
    setActionId(id);
    try {
      await driverOrderService.declineOrder(id, "Declined by driver");
      toast("Order declined", { icon: "👋" });
      setOrders((prev) => prev.filter((o) => (o._id || o.id) !== id));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not decline order");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Status & Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              Dispatch Radar
              <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 tabular-nums">
                {orders.length} Ready
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">Scanning orders near your zone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute order chimes" : "Enable order chimes"}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            {soundEnabled ? <FiVolume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <FiVolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
          </button>
          <button
            onClick={() => loadOrders(false)}
            disabled={loading || refreshing}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? "animate-spin text-emerald-500 dark:text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl space-y-3 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FiRadio className="w-8 h-8 animate-pulse text-emerald-500/70" />
          </div>
          <h2 className="text-base font-semibold text-foreground">No delivery requests right now</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Stay active on this screen. New orders from nearby kitchens and diners will ring automatically.
          </p>
          <button
            onClick={() => loadOrders(false)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Check Again
          </button>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => {
          const orderId = order._id || order.id;
          const deliveryFee = Number(order.deliveryFee || 5.0);
          const tip = Number(order.driverWorkflow?.tip || 0);
          const totalPayout = (deliveryFee + tip).toFixed(2);
          const itemCount = Array.isArray(order.items) ? order.items.length : 1;
          const dropAddress = order.deliveryAddress?.street || order.deliveryStreet || "Drop-off Location";
          const dropCity = order.deliveryAddress?.city || order.deliveryCity || "";
          const isBusy = actionId === orderId;

          return (
            <div
              key={orderId}
              onClick={() => setActiveOfferModalOrder(order)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all shadow-xs hover:shadow-md dark:shadow-xl hover:shadow-emerald-500/5 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Top Row: Order # & Transparent Payout */}
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Order ID
                  </span>
                  <span className="font-mono font-bold text-base tracking-tight text-foreground tabular-nums">
                    #{order.orderNumber || orderId.slice(0, 8)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Guaranteed Pay
                  </span>
                  <span className="font-bold text-xl tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {totalPayout} ETB
                  </span>
                  {tip > 0 && (
                    <span className="text-2xs text-muted-foreground block font-semibold tabular-nums">
                      Base {deliveryFee.toFixed(2)} ETB + {tip.toFixed(2)} ETB Tip
                    </span>
                  )}
                </div>
              </div>

              {/* Waypoints: Pickup -> Drop-off */}
              <div className="space-y-2.5 my-3 py-3 border-y border-slate-100 dark:border-slate-800/70 text-xs flex-1">
                {/* Pickup */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Central Kitchen / Restaurant</p>
                    <p className="text-2xs text-muted-foreground">Pick up ready order ({itemCount} {itemCount === 1 ? "item" : "items"})</p>
                  </div>
                </div>

                {/* Drop-off */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FiMapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{dropAddress}</p>
                    <p className="text-2xs text-muted-foreground">{dropCity || "Customer Destination"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={(e) => handleDecline(e, orderId)}
                  className="py-2.5 px-3 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <FiX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  Decline
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={(e) => handleAccept(e, orderId)}
                  className="py-2.5 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isBusy ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Accept Order
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase 1: DoorDash/Uber Eats Style Timed Offer Modal */}
      <TimedOrderOfferModal
        isOpen={Boolean(activeOfferModalOrder)}
        order={activeOfferModalOrder}
        onAccept={async (id) => {
          await handleAccept({ stopPropagation: () => {} }, id);
          setActiveOfferModalOrder(null);
        }}
        onDecline={(id, reason) => {
          handleDecline({ stopPropagation: () => {} }, id);
          setActiveOfferModalOrder(null);
        }}
      />
    </div>
  );
};

export default AvailableOrdersPage;
