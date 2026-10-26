import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiPackage, 
  FiTruck, 
  FiMapPin, 
  FiClock, 
  FiChevronRight, 
  FiRefreshCw, 
  FiNavigation,
  FiPhone,
  FiCheckCircle
} from "react-icons/fi";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const STATUS_FILTERS = [
  { key: "active", label: "Active Trips" },
  { key: "out_for_delivery", label: "In Transit" },
  { key: "confirmed", label: "Pickup Ready" },
  { key: "all", label: "All Assigned" }
];

const getStatusBadge = (status) => {
  switch (status) {
    case "out_for_delivery":
      return { label: "In Transit", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "preparing":
      return { label: "Kitchen Cooking", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "confirmed":
      return { label: "Pickup Assigned", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case "delivered":
      return { label: "Delivered", bg: "bg-slate-700 text-slate-300 border-slate-600" };
    default:
      return { label: status, bg: "bg-slate-800 text-slate-300 border-slate-700" };
  }
};

const MyDeliveriesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const requestedStatus = filter === "active" || filter === "all" ? "" : filter;
      const data = await driverOrderService.getMyDeliveries(requestedStatus);
      const raw = Array.isArray(data) ? data : [];

      const filtered = filter === "active"
        ? raw.filter((o) => ["confirmed", "preparing", "out_for_delivery"].includes(o.orderStatus))
        : raw;

      setOrders(filtered);
    } catch (error) {
      if (!isSilent) {
        toast.error(error?.response?.data?.message || "Failed to load assigned deliveries");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  return (
    <div className="space-y-4">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FiTruck className="text-emerald-500 dark:text-emerald-400" />
            Active Delivery Trips
          </h1>
          <p className="text-xs text-muted-foreground">Manage orders assigned to your shift</p>
        </div>
        <button
          onClick={() => loadOrders(false)}
          disabled={loading || refreshing}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-xs"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing || loading ? "animate-spin text-emerald-500 dark:text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.key
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FiPackage className="w-7 h-7 text-emerald-500/60" />
          </div>
          <h2 className="text-base font-semibold text-foreground">No active trips assigned</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            You don't have any ongoing deliveries right now. Check the Available tab to pick up new requests.
          </p>
          <button
            onClick={() => navigate("/driver/available")}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            View Available Orders
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => {
          const orderId = order._id || order.id;
          const statusMeta = getStatusBadge(order.orderStatus);
          const deliveryFee = Number(order.deliveryFee || 5.0);
          const tip = Number(order.driverWorkflow?.earnings?.tip || order.driverWorkflow?.tip || 0);
          const totalPayout = (deliveryFee + tip).toFixed(2);
          const dropAddress = order.deliveryAddress?.street || order.deliveryStreet || "Standard Street Address";
          const dropCity = order.deliveryAddress?.city || order.deliveryCity || "";
          const customerPhone = order.customerPhone || order.phone;

          return (
            <div
              key={orderId}
              onClick={() => navigate(`/driver/deliveries/${orderId}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all shadow-xs hover:shadow-md dark:shadow-lg hover:shadow-emerald-500/5 cursor-pointer relative group flex flex-col justify-between"
            >
              <div>
                {/* Header: Order #, Status badge, and Payout */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground tabular-nums">
                      #{order.orderNumber || orderId.slice(0, 8)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border ${statusMeta.bg}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base tabular-nums block">
                      +{totalPayout} ETB
                    </span>
                    {tip > 0 && (
                      <span className="text-2xs text-muted-foreground font-medium tabular-nums">
                        Incl. {tip.toFixed(2)} ETB tip
                      </span>
                    )}
                  </div>
                </div>

                {/* Destination Details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-3 space-y-1.5">
                  <div className="flex items-start gap-2 text-xs">
                    <FiMapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{dropAddress}</p>
                      <p className="text-xs text-muted-foreground">{dropCity || "Destination area"}</p>
                    </div>
                  </div>

                  {customerPhone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-slate-200/80 dark:border-slate-800/60">
                      <FiPhone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span className="truncate">Customer: {order.customerName || "Recipient"} • {customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  <FiNavigation className="w-3.5 h-3.5" />
                  Open Live Trip Console
                </span>
                <FiChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyDeliveriesPage;
