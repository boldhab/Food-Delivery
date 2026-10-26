import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiClock, 
  FiCheckCircle, 
  FiDollarSign, 
  FiMapPin, 
  FiChevronRight, 
  FiRefreshCw, 
  FiArchive 
} from "react-icons/fi";
import toast from "react-hot-toast";
import driverOrderService from "../services/driverOrderService";

const DeliveryHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await driverOrderService.getMyDeliveries("delivered");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load delivery history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const totalBaseFees = orders.reduce((sum, order) => {
    return sum + Number(order.deliveryFee || 5.0);
  }, 0);

  const totalTips = orders.reduce((sum, order) => {
    const tip = Number(order.driverWorkflow?.earnings?.tip || order.driverWorkflow?.tip || 0);
    return sum + tip;
  }, 0);

  const totalNetPayout = totalBaseFees + totalTips;

  return (
    <div className="space-y-4">
      {/* Header & Earnings Summary Card */}
      <div className="bg-linear-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 shadow-xs dark:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiCheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Driver Earnings & History</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Verified payouts & proof-of-delivery ledger</p>
            </div>
          </div>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-transparent"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-500 dark:text-emerald-400" : ""}`} />
          </button>
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-white/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Deliveries
            </span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {orders.length}
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Base Delivery Pay
            </span>
            <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-200">
              ${totalBaseFees.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Tips (100% Kept)
            </span>
            <span className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              ${totalTips.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-emerald-500/40 shadow-xs">
            <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Total Net Payout
            </span>
            <span className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              ${totalNetPayout.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FiArchive className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">No completed deliveries yet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Once you accept orders and mark them as delivered, your earnings and completion logs will appear here.
          </p>
        </div>
      )}

      {/* Completed Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {orders.map((order) => {
          const orderId = order._id || order.id;
          const deliveryFee = Number(order.deliveryFee || 5.0);
          const tip = Number(order.driverWorkflow?.earnings?.tip || order.driverWorkflow?.tip || 0);
          const totalPayout = (deliveryFee + tip).toFixed(2);
          const hasPod = Boolean(order.driverWorkflow?.proofOfDelivery?.imageUrl);
          const dropAddress = order.deliveryAddress?.street || order.deliveryStreet || "Delivered Address";
          const dropCity = order.deliveryAddress?.city || order.deliveryCity || "";
          const completedAt = order.actualDeliveryTime || order.updatedAt;

          return (
            <div
              key={orderId}
              onClick={() => navigate(`/driver/deliveries/${orderId}`)}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center justify-between gap-3 group shadow-xs"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-foreground tabular-nums">
                    #{order.orderNumber || orderId.slice(0, 8)}
                  </span>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Delivered
                  </span>
                  {hasPod && (
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      📸 Photo POD
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 truncate">
                  <FiMapPin className="w-3 h-3 text-slate-400 dark:text-slate-400 shrink-0" />
                  <span className="truncate">{dropAddress}{dropCity ? `, ${dropCity}` : ""}</span>
                </div>

                {completedAt && (
                  <p className="text-2xs text-muted-foreground tabular-nums">
                    {new Date(completedAt).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                    {new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400 block">+{totalPayout} ETB</span>
                  <span className="text-2xs text-muted-foreground block font-medium tabular-nums">
                    {tip > 0 ? `${deliveryFee.toFixed(2)} + ${tip.toFixed(2)} ETB tip` : "Paid"}
                  </span>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryHistoryPage;
