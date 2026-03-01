import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiPackage,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown
} from "react-icons/fi";
import RevenueChart from "../charts/RevenueChart";
import OrdersChart from "../charts/OrdersChart";
import PopularItemsChart from "../charts/PopularItemsChart";
import StatusBadge from "../components/common/StatusBadge";
import { useAdminDataContext } from "../context/AdminDataContext";
import { format, subDays, startOfMonth } from "date-fns";
import { toast } from "react-hot-toast";
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
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  }),
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};
const DashboardPage = () => {
  const {
    state,
    fetchStats,
    fetchOrders,
    fetchFoods,
    fetchUsers,
    isLoading,
    getError,
    subscribeToUpdates,
    exportData
  } = useAdminDataContext();
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: subDays(/* @__PURE__ */ new Date(), 7),
    end: /* @__PURE__ */ new Date(),
    label: "Last 7 Days"
  });
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(/* @__PURE__ */ new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((data) => {
      handleRealTimeUpdate(data);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 3e4);
    return () => clearInterval(interval);
  }, [autoRefresh]);
  useEffect(() => {
    loadDashboardData();
  }, [selectedDateRange]);
  const loadDashboardData = async () => {
    await Promise.all([
      fetchStats(),
      fetchOrders({
        limit: 10,
        dateRange: {
          start: selectedDateRange.start.toISOString(),
          end: selectedDateRange.end.toISOString()
        }
      }),
      fetchFoods({ limit: 5, sortBy: "orderCount", sortOrder: "desc" }),
      fetchUsers({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })
    ]);
    setLastUpdated(/* @__PURE__ */ new Date());
  };
  const refreshData = async () => {
    await loadDashboardData();
    toast.success("Dashboard updated", { icon: "🔄" });
  };
  const handleRealTimeUpdate = (data) => {
    switch (data.type) {
      case "order_created":
        toast.success(`New order #${data.data.orderNumber} received!`, {
          icon: "🛵",
          duration: 5e3
        });
        break;
      case "order_updated":
        toast(`Order #${data.data.orderNumber} status: ${data.data.orderStatus}`, {
          icon: "📦"
        });
        break;
      default:
        break;
    }
    loadDashboardData();
  };
  const handleExport = async (format2) => {
    await exportData("orders", format2);
  };
  const handleDateRangeChange = (range) => {
    const now = /* @__PURE__ */ new Date();
    let start;
    switch (range) {
      case "today":
        start = now;
        break;
      case "yesterday":
        start = subDays(now, 1);
        break;
      case "last7days":
        start = subDays(now, 7);
        break;
      case "last30days":
        start = subDays(now, 30);
        break;
      case "thisMonth":
        start = startOfMonth(now);
        break;
      case "lastMonth":
        start = startOfMonth(subDays(now, 30));
        break;
      default:
        start = subDays(now, 7);
    }
    setSelectedDateRange({
      start,
      end: now,
      label: range
    });
  };
  const metrics = useMemo(() => {
    const stats = state.stats;
    if (!stats) return [];
    const revenueChange = (stats.totalRevenue - (stats.previousPeriodRevenue || 0)) / (stats.previousPeriodRevenue || 1) * 100;
    const ordersChange = (stats.totalOrders - (stats.previousPeriodOrders || 0)) / (stats.previousPeriodOrders || 1) * 100;
    const usersChange = (stats.totalUsers - (stats.previousPeriodUsers || 0)) / (stats.previousPeriodUsers || 1) * 100;
    return [
      {
        title: "Total Revenue",
        value: `$${stats.totalRevenue?.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
        icon: FiDollarSign,
        change: revenueChange,
        color: "#f97316",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400"
      },
      {
        title: "Total Orders",
        value: stats.totalOrders?.toLocaleString() || "0",
        icon: FiShoppingBag,
        change: ordersChange,
        color: "#3b82f6",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400"
      },
      {
        title: "Active Users",
        value: stats.activeUsers?.toLocaleString() || "0",
        icon: FiUsers,
        change: usersChange,
        color: "#10b981",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-600 dark:text-green-400"
      },
      {
        title: "Avg Order Value",
        value: `$${stats.averageOrderValue?.toFixed(2) || "0.00"}`,
        icon: FiTrendingUp,
        change: 5.2,
        color: "#8b5cf6",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400"
      }
    ];
  }, [state.stats]);
  const statusDistribution = useMemo(() => {
    const stats = state.stats;
    if (!stats?.ordersByStatus) return [];
    return Object.entries(stats.ordersByStatus).map(([status, count]) => ({
      status,
      count,
      percentage: (count / stats.totalOrders * 100).toFixed(1)
    }));
  }, [state.stats]);
  if (isLoading("stats") && !state.stats) {
    return <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900/30 
                                      border-t-orange-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiTrendingUp className="w-6 h-6 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading dashboard analytics...
                    </p>
                </div>
            </div>;
  }
  return <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-8 pb-8"
  >
            {
    /* Header */
  }
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1
    variants={itemVariants}
    className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
  >
                        Admin Dashboard
                    </motion.h1>
                    <motion.p
    variants={itemVariants}
    className="text-slate-600 dark:text-slate-400 mt-1 font-medium"
  >
                        Business overview, sales performance, and live trends
                    </motion.p>
                </div>

                <motion.div
    variants={itemVariants}
    className="flex flex-wrap items-center gap-3"
  >
                    {
    /* Date Range Selector */
  }
                    <div className="relative">
                        <select
    value={selectedDateRange.label}
    onChange={(e) => handleDateRangeChange(e.target.value)}
    className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-sm text-slate-700 dark:text-slate-300
                                     focus:outline-none focus:border-orange-500
                                     appearance-none cursor-pointer"
  >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                        </select>
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    {
    /* Export Dropdown */
  }
                    <div className="relative">
                        <button
    onClick={() => setShowQuickActions(!showQuickActions)}
    className="px-4 py-2.5 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     hover:border-orange-500 transition-colors
                                     flex items-center gap-2"
  >
                            <FiDownload className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <AnimatePresence>
                            {showQuickActions && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                             overflow-hidden z-10"
  >
                                    {["csv", "excel", "pdf"].map((format2) => <button
    key={format2}
    onClick={() => {
      handleExport(format2);
      setShowQuickActions(false);
    }}
    className="w-full px-4 py-3 text-left text-sm
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2"
  >
                                            <FiDownload className="w-4 h-4" />
                                            <span className="capitalize">Export as {format2.toUpperCase()}</span>
                                        </button>)}
                                </motion.div>}
                        </AnimatePresence>
                    </div>

                    {
    /* Refresh Button */
  }
                    <button
    onClick={refreshData}
    disabled={isLoading("stats")}
    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-xl transition-colors
                                 flex items-center gap-2 shadow-lg shadow-orange-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed"
  >
                        <FiRefreshCw className={`w-4 h-4 ${isLoading("stats") ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </motion.div>
            </div>

            {
    /* Last Updated */
  }
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs text-slate-500">
                <FiClock className="w-3 h-3" />
                <span>Last updated: {format(lastUpdated, "MMM d, yyyy h:mm:ss a")}</span>
                <label className="flex items-center gap-1 ml-4">
                    <input
    type="checkbox"
    checked={autoRefresh}
    onChange={(e) => setAutoRefresh(e.target.checked)}
    className="w-3 h-3 text-orange-500 rounded"
  />
                    <span>Auto-refresh (30s)</span>
                </label>
            </motion.div>

            {
    /* Error Display */
  }
            <AnimatePresence>
                {getError("stats") && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-4 bg-red-50 dark:bg-red-900/20
                                 border border-red-200 dark:border-red-800
                                 rounded-xl flex items-center gap-3"
  >
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                            {getError("stats")}
                        </span>
                        <button
    onClick={refreshData}
    className="ml-auto text-sm text-red-600 hover:text-red-700"
  >
                            Retry
                        </button>
                    </motion.div>}
            </AnimatePresence>

            {
    /* Metric Cards */
  }
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {metrics.map((metric, index) => <motion.div
    key={metric.title}
    custom={index}
    variants={cardVariants}
    whileHover="hover"
    className="bg-white dark:bg-slate-800 rounded-2xl p-6
                                 border border-slate-200 dark:border-slate-700
                                 shadow-sm hover:shadow-md transition-shadow"
  >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {metric.title}
                                </p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                                    {metric.value}
                                </h3>
                                <div className="flex items-center gap-1 mt-3">
                                    {metric.change > 0 ? <FiArrowUp className="w-3 h-3 text-green-500" /> : <FiArrowDown className="w-3 h-3 text-red-500" />}
                                    <span className={`text-xs font-medium ${metric.change > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {Math.abs(metric.change).toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-slate-500 ml-1">vs previous period</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
                            </div>
                        </div>
                    </motion.div>)}
            </div>

            {
    /* Status Distribution */
  }
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statusDistribution.map((item) => <div
    key={item.status}
    className="bg-white dark:bg-slate-800 rounded-xl p-4
                                 border border-slate-200 dark:border-slate-700
                                 text-center"
  >
                        <StatusBadge status={item.status} type="order" size="sm" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                            {item.count}
                        </p>
                        <p className="text-xs text-slate-500">
                            {item.percentage}% of total
                        </p>
                    </div>)}
            </motion.div>

            {
    /* Charts Row 1 */
  }
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
    variants={itemVariants}
    className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6
                             border border-slate-200 dark:border-slate-700"
  >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Revenue Insights
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {selectedDateRange.label} performance
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {["revenue", "orders", "users"].map((metric) => <button
    key={metric}
    onClick={() => setSelectedMetric(metric)}
    className={`
                                        px-3 py-1.5 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${selectedMetric === metric ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}
                                    `}
  >
                                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                </button>)}
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <RevenueChart
    data={state.stats?.revenueByDay || []}
    metric={selectedMetric}
  />
                    </div>
                </motion.div>

                <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6
                             border border-slate-200 dark:border-slate-700"
  >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Order Distribution
                    </h2>
                    <div className="h-[350px] flex items-center justify-center">
                        <OrdersChart
    data={state.stats?.ordersByStatus || []}
    variant="detailed"
  />
                    </div>
                </motion.div>
            </div>

            {
    /* Charts Row 2 */
  }
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6
                             border border-slate-200 dark:border-slate-700"
  >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Top Selling Items
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Most popular food items
                            </p>
                        </div>
                        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                            View All
                        </button>
                    </div>
                    <PopularItemsChart data={state.stats?.topSellingFoods || []} />
                </motion.div>

                {
    /* Recent Orders */
  }
                <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6
                             border border-slate-200 dark:border-slate-700"
  >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Recent Orders
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Latest customer orders
                            </p>
                        </div>
                        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {state.orders.slice(0, 5).map((order, index) => <motion.div
    key={order._id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center justify-between p-3
                                         bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                         hover:bg-slate-100 dark:hover:bg-slate-800
                                         transition-colors cursor-pointer group"
  >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30
                                                  rounded-lg flex items-center justify-center">
                                        <FiShoppingBag className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            #{order.orderNumber}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {order.customer?.name || "Customer"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-orange-500">
                                        ${order.totalAmount?.toFixed(2)}
                                    </p>
                                    <StatusBadge
    status={order.orderStatus}
    type="order"
    size="sm"
  />
                                </div>
                            </motion.div>)}
                    </div>
                </motion.div>
            </div>

            {
    /* Quick Stats Row */
  }
            <motion.div
    variants={itemVariants}
    className="grid grid-cols-1 md:grid-cols-3 gap-6"
  >
                {
    /* Popular Categories */
  }
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6
                              border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Popular Categories
                    </h3>
                    <div className="space-y-3">
                        {state.stats?.popularCategories?.map((cat, index) => <div key={cat.name} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {cat.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {cat.count}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        ({cat.percentage}%)
                                    </span>
                                </div>
                            </div>)}
                    </div>
                </div>

                {
    /* Peak Hours */
  }
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6
                              border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Peak Order Hours
                    </h3>
                    <div className="space-y-3">
                        {state.stats?.peakHours?.map((hour, index) => <div key={hour.hour} className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400 w-16">
                                    {hour.hour}:00
                                </span>
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${hour.percentage}%` }}
    transition={{ duration: 1, delay: index * 0.1 }}
    className="h-full bg-orange-500 rounded-full"
  />
                                </div>
                                <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                                    {hour.count}
                                </span>
                            </div>)}
                    </div>
                </div>

                {
    /* Recent Activity */
  }
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6
                              border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {state.stats?.recentActivity?.map((activity, index) => <div key={index} className="flex items-start gap-3">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${activity.type === "order" && "bg-blue-100 text-blue-500"}
                                    ${activity.type === "user" && "bg-green-100 text-green-500"}
                                    ${activity.type === "food" && "bg-orange-100 text-orange-500"}
                                `}>
                                    {activity.type === "order" && <FiShoppingBag className="w-4 h-4" />}
                                    {activity.type === "user" && <FiUsers className="w-4 h-4" />}
                                    {activity.type === "food" && <FiPackage className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {format(new Date(activity.timestamp), "HH:mm:ss")}
                                    </p>
                                </div>
                            </div>)}
                    </div>
                </div>
            </motion.div>
        </motion.div>;
};
var stdin_default = DashboardPage;
export {
  stdin_default as default
};
