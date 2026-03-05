import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiPrinter,
  FiMail,
  FiMessageSquare,
  FiClock,
  FiPackage,
  FiDollarSign,
  FiSliders,
  FiAlertCircle,
  FiPieChart,
  FiTrendingUp
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-hot-toast";
import { useAdminDataContext } from "../context/adminDataContextCore";
import StatusBadge from "../components/common/StatusBadge";
import adminOrderService from "../services/adminOrderService";
import adminNotificationService from "../services/adminNotificationService";
const _MOTION = motion;
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
const ORDER_STATUS_ROUTES = {
  "/admin/orders/pending": "pending",
  "/admin/orders/complete": "delivered",
  "/admin/orders/completed": "delivered",
  "/admin/orders/canceled": "cancelled",
  "/admin/orders/cancelled": "cancelled"
};
const normalizeOrderStatus = (status) => {
  if (!status) return "";
  const normalized = status.toLowerCase().trim();
  if (normalized === "complete" || normalized === "completed") return "delivered";
  if (normalized === "canceled") return "cancelled";
  return normalized;
};
const ORDER_VIEW_META = {
  "": {
    title: "Orders",
    description: "Track, manage, and update customer orders"
  },
  pending: {
    title: "Pending Orders",
    description: "Review new orders and take action quickly."
  },
  delivered: {
    title: "Completed Orders",
    description: "View successfully delivered orders in detail."
  },
  cancelled: {
    title: "Cancelled Orders",
    description: "Audit cancelled orders and cancellation reasons."
  }
};
const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    fetchOrders,
    isLoading,
    getError,
    clearFilters,
    pagination,
    goToPage,
    setPageSize,
    bulkUpdateOrders,
    exportData
  } = useAdminDataContext();
  const [localFilters, setLocalFilters] = useState({
    status: "",
    paymentStatus: "",
    search: "",
    dateRange: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    paymentMethod: "",
    driver: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const orders = Array.isArray(state.orders) ? state.orders : [];
  const routeStatus = useMemo(() => {
    const fromPath = ORDER_STATUS_ROUTES[location.pathname];
    if (fromPath) return fromPath;

    const fromQuery = normalizeOrderStatus(new URLSearchParams(location.search).get("status"));
    const validStatuses = new Set(["pending", "delivered", "cancelled"]);
    return validStatuses.has(fromQuery) ? fromQuery : "";
  }, [location.pathname, location.search]);
  const activeStatus = routeStatus || localFilters.status;
  const currentView = ORDER_VIEW_META[routeStatus] || ORDER_VIEW_META[""];
  const loadOrders = useCallback(async () => {
    const filters = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage
    };
    if (activeStatus) filters.status = activeStatus;
    if (localFilters.paymentStatus) filters.paymentStatus = localFilters.paymentStatus;
    if (localFilters.search) filters.search = localFilters.search;
    if (localFilters.paymentMethod) filters.paymentMethod = localFilters.paymentMethod;
    if (localFilters.driver) filters.driver = localFilters.driver;
    if (localFilters.dateRange !== "custom") {
      const now = /* @__PURE__ */ new Date();
      switch (localFilters.dateRange) {
        case "today":
          filters.startDate = format(now, "yyyy-MM-dd");
          filters.endDate = format(now, "yyyy-MM-dd");
          break;
        case "yesterday": {
          const yesterday = subDays(now, 1);
          filters.startDate = format(yesterday, "yyyy-MM-dd");
          filters.endDate = format(yesterday, "yyyy-MM-dd");
          break;
        }
        case "last7days":
          filters.startDate = format(subDays(now, 7), "yyyy-MM-dd");
          filters.endDate = format(now, "yyyy-MM-dd");
          break;
        case "last30days":
          filters.startDate = format(subDays(now, 30), "yyyy-MM-dd");
          filters.endDate = format(now, "yyyy-MM-dd");
          break;
        case "thisMonth":
          filters.startDate = format(startOfMonth(now), "yyyy-MM-dd");
          filters.endDate = format(endOfMonth(now), "yyyy-MM-dd");
          break;
        case "lastMonth": {
          const lastMonth = subDays(startOfMonth(now), 1);
          filters.startDate = format(startOfMonth(lastMonth), "yyyy-MM-dd");
          filters.endDate = format(endOfMonth(lastMonth), "yyyy-MM-dd");
          break;
        }
      }
    } else {
      if (localFilters.startDate) filters.startDate = localFilters.startDate;
      if (localFilters.endDate) filters.endDate = localFilters.endDate;
    }
    if (localFilters.minAmount) filters.minAmount = localFilters.minAmount;
    if (localFilters.maxAmount) filters.maxAmount = localFilters.maxAmount;
    await fetchOrders(filters);
  }, [activeStatus, fetchOrders, localFilters, pagination.currentPage, pagination.itemsPerPage]);
  const loadOrderStats = useCallback(async () => {
    try {
      const response = await adminOrderService.getOrderStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load order stats:", error);
    }
  }, []);
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);
  useEffect(() => {
    loadOrderStats();
  }, [loadOrderStats]);
  const handleRefresh = async () => {
    await loadOrders();
    await loadOrderStats();
    toast.success("Orders refreshed");
  };
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`, {
      state: { from: `${location.pathname}${location.search}` }
    });
  };
  const handlePrintOrder = () => {
    window.print();
  };
  const handleSendEmail = async (order) => {
    try {
      await adminNotificationService.sendOrderEmail(order._id);
      toast.success("Email sent to customer");
    } catch {
      toast.error("Failed to send email");
    }
  };
  const handleSendSMS = async (order) => {
    try {
      await adminNotificationService.sendOrderSMS(order._id);
      toast.success("SMS sent to customer");
    } catch {
      toast.error("Failed to send SMS");
    }
  };
  const handleBulkUpdate = async (updates) => {
    await bulkUpdateOrders(selectedOrders, updates);
    setSelectedOrders([]);
    setShowBulkActions(false);
    loadOrders();
  };
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      await bulkUpdateOrders(selectedOrders, { isDeleted: true });
      setSelectedOrders([]);
      setShowBulkActions(false);
      loadOrders();
    }
  };
  const handleExport = async (format2) => {
    await exportData("orders", format2);
  };
  const handleClearFilters = () => {
    if (routeStatus || location.search) {
      navigate("/admin/orders");
    }
    setLocalFilters({
      status: "",
      paymentStatus: "",
      search: "",
      dateRange: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      paymentMethod: "",
      driver: ""
    });
    clearFilters();
    loadOrders();
  };
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "confirmed", label: "Confirmed", color: "blue" },
    { value: "preparing", label: "Preparing", color: "orange" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "purple" },
    { value: "delivered", label: "Delivered", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" }
  ];
  const paymentStatusOptions = [
    { value: "", label: "All Payment" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" }
  ];
  const paymentMethodOptions = [
    { value: "", label: "All Methods" },
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "cash", label: "Cash" }
  ];
  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "custom", label: "Custom Range" }
  ];
  const areAllVisibleSelected = orders.length > 0 && orders.every((order) => selectedOrders.includes(order._id));
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) => prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]);
  };
  const toggleSelectAllVisible = () => {
    if (areAllVisibleSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !orders.some((order) => order._id === id)));
      return;
    }
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      orders.forEach((order) => next.add(order._id));
      return Array.from(next);
    });
  };
  const renderFilterPanel = () => <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="overflow-hidden"
  >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
    /* Status Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Order Status
                        </label>
                        <select
    value={activeStatus}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
    disabled={Boolean(routeStatus)}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            {statusOptions.map((option) => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                        </select>
                    </div>

                    {
    /* Payment Status */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Status
                        </label>
                        <select
    value={localFilters.paymentStatus}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            {paymentStatusOptions.map((option) => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                        </select>
                    </div>

                    {
    /* Payment Method */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Method
                        </label>
                        <select
    value={localFilters.paymentMethod}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            {paymentMethodOptions.map((option) => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                        </select>
                    </div>

                    {
    /* Date Range */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Date Range
                        </label>
                        <select
    value={localFilters.dateRange}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            {dateRangeOptions.map((option) => <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>)}
                        </select>
                    </div>

                    {
    /* Custom Date Range */
  }
                    {localFilters.dateRange === "custom" && <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Start Date
                                </label>
                                <input
    type="date"
    value={localFilters.startDate}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, startDate: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
  />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    End Date
                                </label>
                                <input
    type="date"
    value={localFilters.endDate}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
  />
                            </div>
                        </>}

                    {
    /* Amount Range */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Min Amount
                        </label>
                        <input
    type="number"
    value={localFilters.minAmount}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
    placeholder="0"
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Max Amount
                        </label>
                        <input
    type="number"
    value={localFilters.maxAmount}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
    placeholder="1000"
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  />
                    </div>
                </div>

                {
    /* Active Filters */
  }
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {activeStatus && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Status: {statusOptions.find((o) => o.value === activeStatus)?.label}
                                <button onClick={() => navigate("/admin/orders")}>×</button>
                            </span>}
                        {localFilters.paymentStatus && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Payment: {paymentStatusOptions.find((o) => o.value === localFilters.paymentStatus)?.label}
                                <button onClick={() => setLocalFilters((prev) => ({ ...prev, paymentStatus: "" }))}>×</button>
                            </span>}
                        {localFilters.dateRange !== "all" && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                {dateRangeOptions.find((o) => o.value === localFilters.dateRange)?.label}
                                <button onClick={() => setLocalFilters((prev) => ({ ...prev, dateRange: "all" }))}>×</button>
                            </span>}
                    </div>
                    
                    <button
    onClick={handleClearFilters}
    className="text-xs text-orange-500 hover:text-orange-600"
  >
                        Clear All
                    </button>
                </div>
            </div>
        </motion.div>;
  const renderStatsCards = () => <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
  >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.totalOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.totalRevenue?.toFixed(2) || "0"}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Avg Order Value</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.averageOrderValue?.toFixed(2) || "0"}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.pendingOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-yellow-600" />
                    </div>
                </div>
            </div>
        </motion.div>;
  const renderBulkActionsBar = () => <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                     bg-white dark:bg-slate-800 rounded-xl shadow-2xl
                     border border-slate-200 dark:border-slate-700
                     p-4 flex items-center gap-4"
  >
            <span className="text-sm font-medium">
                {selectedOrders.length} orders selected
            </span>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <select
    onChange={(e) => {
      const value = e.target.value;
      if (value === "confirmed" || value === "preparing" || value === "out_for_delivery" || value === "delivered") {
        handleBulkUpdate({ orderStatus: value });
      } else if (value === "delete") {
        handleBulkDelete();
      }
      e.target.value = "";
    }}
    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
                         border border-transparent rounded-lg text-sm
                         focus:outline-none focus:border-orange-500"
  >
                <option value="">Bulk Actions</option>
                <optgroup label="Update Status">
                    <option value="confirmed">Mark as Confirmed</option>
                    <option value="preparing">Mark as Preparing</option>
                    <option value="out_for_delivery">Mark as Out for Delivery</option>
                    <option value="delivered">Mark as Delivered</option>
                </optgroup>
                <option value="delete" className="text-red-500">Delete Selected</option>
            </select>

            <button
    onClick={() => setSelectedOrders([])}
    className="text-slate-400 hover:text-slate-600"
  >
                Cancel
            </button>
        </motion.div>;
  return <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
            {
    /* Header */
  }
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        {currentView.title}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {currentView.description}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                        Card view
                    </div>

                    {
    /* Stats Toggle */
  }
                    <button
    onClick={() => setShowStats(!showStats)}
    className={`p-2 rounded-lg transition-colors ${showStats ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-orange-500"}`}
    title="Toggle Statistics"
  >
                        <FiPieChart className="w-4 h-4" />
                    </button>

                    {
    /* Export Dropdown */
  }
                    <div className="relative">
                        <button
    onClick={() => setShowBulkActions(!showBulkActions)}
    className="px-4 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     hover:border-orange-500 transition-colors
                                     flex items-center gap-2"
  >
                            <FiDownload className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <AnimatePresence>
                            {showBulkActions && <motion.div
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
      setShowBulkActions(false);
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
    onClick={handleRefresh}
    disabled={isLoading("orders")}
    className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-xl transition-colors
                                 flex items-center gap-2 shadow-lg shadow-orange-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed"
  >
                        <FiRefreshCw className={`w-4 h-4 ${isLoading("orders") ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {[{
    label: "All Orders",
    path: "/admin/orders",
    status: ""
  }, {
    label: "Pending",
    path: "/admin/orders/pending",
    status: "pending"
  }, {
    label: "Completed",
    path: "/admin/orders/completed",
    status: "delivered"
  }, {
    label: "Cancelled",
    path: "/admin/orders/canceled",
    status: "cancelled"
  }].map((view) => <button
    key={view.path}
    onClick={() => navigate(view.path)}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${routeStatus === view.status ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400"}`}
  >
                        {view.label}
                    </button>)}
            </motion.div>

            {
    /* Stats Section */
  }
            <AnimatePresence>
                {showStats && stats && renderStatsCards()}
            </AnimatePresence>

            {
    /* Search and Filters */
  }
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {
    /* Search */
  }
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
    value={localFilters.search}
    onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value }))}
    placeholder="Search by order #, customer name, email..."
    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm
                                     focus:outline-none focus:border-orange-500
                                     focus:ring-2 focus:ring-orange-500/20"
  />
                    </div>

                    {
    /* Filter Toggle */
  }
                    <button
    onClick={() => setShowFilters(!showFilters)}
    className={`px-4 py-2 rounded-lg border transition-colors
                                 flex items-center gap-2
                                 ${showFilters ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500"}`}
  >
                        <FiSliders className="w-4 h-4" />
                        <span>Filters</span>
                        {Object.values(localFilters).filter((v) => v && v !== "all" && v !== "").length > 0 && <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                                {Object.values(localFilters).filter((v) => v && v !== "all" && v !== "").length}
                            </span>}
                    </button>
                </div>

                {
    /* Filter Panel */
  }
                <AnimatePresence>
                    {showFilters && renderFilterPanel()}
                </AnimatePresence>
            </motion.div>

            {
    /* Error Display */
  }
            <AnimatePresence>
                {getError("orders") && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-4 bg-red-50 dark:bg-red-900/20
                                 border border-red-200 dark:border-red-800
                                 rounded-xl flex items-center gap-3"
  >
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                            {getError("orders")}
                        </span>
                        <button
    onClick={handleRefresh}
    className="ml-auto text-sm text-red-600 hover:text-red-700"
  >
                            Retry
                        </button>
                    </motion.div>}
            </AnimatePresence>

            {
    /* Orders Cards */
  }
            <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <input
    type="checkbox"
    checked={areAllVisibleSelected}
    onChange={toggleSelectAllVisible}
    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
  />
                            Select all on this page
                        </label>
                        <span className="text-xs text-slate-500">
                            {pagination.totalItems || 0} total orders
                        </span>
                    </div>

                    {isLoading("orders") ? <div className="py-16 text-center text-slate-500">Loading orders...</div> : orders.length === 0 ? <div className="py-16 text-center">
                            <p className="text-slate-600 dark:text-slate-300 font-medium">No data available</p>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add new data</p>
                        </div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {orders.map((order) => <motion.div
    key={order._id}
    layout
    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/40 dark:bg-slate-900/30 hover:border-orange-400 transition-colors"
  >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Order</p>
                                            <p className="font-mono font-semibold text-slate-900 dark:text-white">#{order.orderNumber}</p>
                                        </div>
                                        <input
    type="checkbox"
    checked={selectedOrders.includes(order._id)}
    onChange={() => toggleOrderSelection(order._id)}
    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 mt-1"
  />
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm">
                                        <p className="text-slate-900 dark:text-white font-medium">{order.customer?.name || "N/A"}</p>
                                        <p className="text-slate-500 truncate">{order.customer?.email || "No email"}</p>
                                        <p className="text-slate-700 dark:text-slate-200 font-semibold">${Number(order.totalAmount || 0).toFixed(2)}</p>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <StatusBadge status={order.orderStatus} type="order" variant="pill" showIcon />
                                        <StatusBadge status={order.paymentStatus} type="payment" variant="dot" />
                                    </div>

                                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                                        <p>{format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}</p>
                                        <p>Payment: {(order.paymentMethod || "N/A").replace("_", " ")}</p>
                                        <p>Driver: {order.driver?.name || "Unassigned"}</p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
      onClick={() => handleViewOrder(order._id)}
      className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
      title="View Order"
    >
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        <button
      onClick={() => handlePrintOrder(order)}
      className="p-1.5 text-slate-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
      title="Print Order"
    >
                                            <FiPrinter className="w-4 h-4" />
                                        </button>
                                        <button
      onClick={() => handleSendEmail(order)}
      className="p-1.5 text-slate-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
      title="Send Email"
    >
                                            <FiMail className="w-4 h-4" />
                                        </button>
                                        <button
      onClick={() => handleSendSMS(order)}
      className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
      title="Send SMS"
    >
                                            <FiMessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>)}
                        </div>}

                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Rows:</span>
                            <select
    value={pagination.itemsPerPage}
    onChange={(e) => setPageSize(Number(e.target.value))}
    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
  >
                                {[10, 25, 50, 100].map((size) => <option key={size} value={size}>
                                        {size}
                                    </option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
    onClick={() => goToPage(Math.max(1, pagination.currentPage - 1))}
    disabled={pagination.currentPage <= 1}
    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
  >
                                Previous
                            </button>
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                Page {pagination.currentPage} of {pagination.totalPages || 1}
                            </span>
                            <button
    onClick={() => goToPage(Math.min(pagination.totalPages || 1, pagination.currentPage + 1))}
    disabled={pagination.currentPage >= (pagination.totalPages || 1)}
    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
  >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {
    /* Bulk Actions Bar */
  }
            <AnimatePresence>
                {selectedOrders.length > 0 && renderBulkActionsBar()}
            </AnimatePresence>
        </motion.div>;
};

export default OrdersPage;

