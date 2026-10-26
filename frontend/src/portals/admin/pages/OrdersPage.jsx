import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-hot-toast";

import { useAdminDataContext } from "../context/adminDataContextCore";
import adminOrderService from "../services/adminOrderService";
import adminNotificationService from "../services/adminNotificationService";

import OrderStatsCards from "./orders/components/OrderStatsCards";
import OrderFilters from "./orders/components/OrderFilters";
import OrderBulkActionsBar from "./orders/components/OrderBulkActionsBar";
import OrderHeaderToolbar from "./orders/components/OrderHeaderToolbar";
import OrderCardGrid from "./orders/components/OrderCardGrid";
import OrderTableView from "./orders/components/OrderTableView";

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

const statusOptions = [
  { value: "", label: "All Status", color: "yellow" },
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
  const [viewMode, setViewMode] = useState("table");

  const orders = Array.isArray(state.orders) ? state.orders : [];

  const routeStatus = useMemo(() => {
    const fromPath = ORDER_STATUS_ROUTES[location.pathname];
    if (fromPath) return fromPath;

    const fromQuery = normalizeOrderStatus(new URLSearchParams(location.search).get("status"));
    const validStatuses = new Set(["pending", "delivered", "cancelled"]);
    return validStatuses.has(fromQuery) ? fromQuery : "";
  }, [location.pathname, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get("search") || params.get("q") || "";
    if (searchFromUrl) {
      setLocalFilters((prev) => ({ ...prev, search: searchFromUrl }));
    }
  }, [location.search]);

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
      const now = new Date();
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
        default:
          break;
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

  const handleExport = async (formatType) => {
    const isSelected = selectedOrders && selectedOrders.length > 0;
    await exportData("orders", formatType, {
      selectedIds: isSelected ? selectedOrders : [],
      filters: {
        status: localFilters.status || undefined,
        paymentStatus: localFilters.paymentStatus || undefined,
        search: localFilters.search || undefined,
        dateRange: localFilters.dateRange || undefined,
        startDate: localFilters.startDate || undefined,
        endDate: localFilters.endDate || undefined
      }
    });
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

  const areAllVisibleSelected = orders.length > 0 && orders.every((order) => selectedOrders.includes(order._id));

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
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

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v && v !== "all" && v !== ""
  ).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header and Toolbar */}
      <motion.div variants={itemVariants}>
        <OrderHeaderToolbar
          currentView={currentView}
          routeStatus={routeStatus}
          onNavigateView={(path) => navigate(path)}
          showStats={showStats}
          setShowStats={setShowStats}
          showBulkActions={showBulkActions}
          setShowBulkActions={setShowBulkActions}
          handleExport={handleExport}
          selectedCount={selectedOrders.length}
          handleRefresh={handleRefresh}
          isLoadingOrders={isLoading("orders")}
          search={localFilters.search}
          onSearchChange={(value) => setLocalFilters((prev) => ({ ...prev, search: value }))}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
        >
          <AnimatePresence>
            {showFilters && (
              <OrderFilters
                activeStatus={activeStatus}
                routeStatus={routeStatus}
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                statusOptions={statusOptions}
                paymentStatusOptions={paymentStatusOptions}
                paymentMethodOptions={paymentMethodOptions}
                dateRangeOptions={dateRangeOptions}
                handleClearFilters={handleClearFilters}
                onStatusNavigateReset={() => navigate("/admin/orders")}
              />
            )}
          </AnimatePresence>
        </OrderHeaderToolbar>
      </motion.div>

      {/* Stats Summary Cards */}
      <AnimatePresence>
        {showStats && stats && <OrderStatsCards stats={stats} />}
      </AnimatePresence>

      {/* Error Alert Display */}
      <AnimatePresence>
        {getError("orders") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {getError("orders")}
            </span>
            <button
              onClick={handleRefresh}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table or Grid Display */}
      <motion.div variants={itemVariants}>
        {viewMode === "table" ? (
          <OrderTableView
            orders={orders}
            isLoading={isLoading("orders")}
            totalItems={pagination.totalItems}
            selectedOrders={selectedOrders}
            areAllVisibleSelected={areAllVisibleSelected}
            toggleSelectAllVisible={toggleSelectAllVisible}
            toggleOrderSelection={toggleOrderSelection}
            onViewOrder={handleViewOrder}
            onPrintOrder={handlePrintOrder}
            onSendEmail={handleSendEmail}
            onSendSMS={handleSendSMS}
            pagination={pagination}
            goToPage={(page) => goToPage("orders", page)}
            setPageSize={(size) => setPageSize("orders", size)}
          />
        ) : (
          <OrderCardGrid
            orders={orders}
            isLoading={isLoading("orders")}
            totalItems={pagination.totalItems}
            selectedOrders={selectedOrders}
            areAllVisibleSelected={areAllVisibleSelected}
            toggleSelectAllVisible={toggleSelectAllVisible}
            toggleOrderSelection={toggleOrderSelection}
            onViewOrder={handleViewOrder}
            onPrintOrder={handlePrintOrder}
            onSendEmail={handleSendEmail}
            onSendSMS={handleSendSMS}
            pagination={pagination}
            goToPage={(page) => goToPage("orders", page)}
            setPageSize={(size) => setPageSize("orders", size)}
          />
        )}
      </motion.div>

      {/* Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <OrderBulkActionsBar
            selectedCount={selectedOrders.length}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onCancel={() => setSelectedOrders([])}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersPage;
