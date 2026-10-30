import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiActivity,
  FiPieChart,
  FiTruck,
  FiClock
} from "react-icons/fi";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { subDays, startOfMonth } from "date-fns";
import { toast } from "react-hot-toast";

import { useAdminDataContext } from "../context/adminDataContextCore";
import DashboardHeader from "./dashboard/components/DashboardHeader";
import DashboardMetricCards from "./dashboard/components/DashboardMetricCards";
import OrderStatusDistribution from "./dashboard/components/OrderStatusDistribution";
import DashboardChartsSection from "./dashboard/components/DashboardChartsSection";
import RecentOrdersAndTopSelling from "./dashboard/components/RecentOrdersAndTopSelling";
import QuickStatsRow from "./dashboard/components/QuickStatsRow";
import LiveOperationsCenter from "./dashboard/components/LiveOperationsCenter";
import LiveOperationsPulse from "./dashboard/components/LiveOperationsPulse";
import QuickReportInsights from "./dashboard/components/QuickReportInsights";
import { exportReport } from "../utils/reportExport";

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

const DashboardPage = ({ defaultTab = "analytics" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    } else {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("tab", newTab);
    setSearchParams(updatedParams, { replace: true });
  };

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
    start: subDays(new Date(), 7),
    end: new Date(),
    label: "Last 7 Days"
  });

  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadDashboardData = useCallback(async () => {
    await Promise.all([
      fetchStats({
        startDate: selectedDateRange.start.toISOString(),
        endDate: selectedDateRange.end.toISOString()
      }, true),
      fetchOrders({
        limit: 10,
        dateRange: {
          start: selectedDateRange.start.toISOString(),
          end: selectedDateRange.end.toISOString()
        }
      }, true),
      fetchFoods({ limit: 5, sortBy: "orderCount", sortOrder: "desc" }),
      fetchUsers({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })
    ]);
    setLastUpdated(new Date());
  }, [fetchFoods, fetchOrders, fetchStats, fetchUsers, selectedDateRange.end, selectedDateRange.start]);

  const refreshData = useCallback(async () => {
    await loadDashboardData();
    toast.success("Dashboard updated", { icon: "🔄" });
  }, [loadDashboardData]);

  const handleRealTimeUpdate = useCallback((data) => {
    switch (data.type) {
      case "order_created":
        toast.success(`New order #${data.data.orderNumber} received!`, {
          icon: "🛵",
          duration: 5000
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
  }, [loadDashboardData]);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates((data) => {
      handleRealTimeUpdate(data);
    });
    return unsubscribe;
  }, [handleRealTimeUpdate, subscribeToUpdates]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleExport = async (formatType) => {
    try {
      const exportPayload = {
        kpis: {
          totalRevenue: state.stats?.totalRevenue || 0,
          totalOrders: state.stats?.totalOrders || 0,
          avgOrderValue: state.stats?.averageOrderValue || 0,
          conversionRate: 100
        },
        salesData: state.stats?.revenueByDay || [],
        orders: Array.isArray(state.orders) ? state.orders : []
      };
      exportReport("dashboard", exportPayload, formatType, {
        dateRange: selectedDateRange.label
      });
      toast.success(`Dashboard data exported as ${formatType.toUpperCase()}`);
    } catch {
      toast.error("Failed to export dashboard data");
    }
  };

  const handleDateRangeChange = (range) => {
    const now = new Date();
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

  const ordersList = Array.isArray(state.orders) ? state.orders : [];
  const pendingOrdersCount = ordersList.filter((o) => o.orderStatus === "pending").length;
  const kitchenOrdersCount = ordersList.filter((o) => o.orderStatus === "preparing").length;
  const outForDeliveryCount = ordersList.filter((o) => o.orderStatus === "out_for_delivery").length;
  const activeOrdersCount = pendingOrdersCount + kitchenOrdersCount + outForDeliveryCount;

  const usersList = Array.isArray(state.users) ? state.users : [];
  const driversList = usersList.filter((u) => u.role === "driver");
  const onlineCouriersCount =
    driversList.filter((d) => d.isActive).length || Math.max(outForDeliveryCount, 5);

  const metrics = useMemo(() => {
    const stats = state.stats;
    if (!stats) return [];

    const prevRev = Number(stats.previousPeriodRevenue || 0);
    const currRev = Number(stats.totalRevenue || 0);
    const revenueChange = prevRev > 0
      ? ((currRev - prevRev) / prevRev) * 100
      : (currRev > 0 ? 100 : 0);

    const prevOrders = Number(stats.previousPeriodOrders || 0);
    const currOrders = Number(stats.totalOrders || 0);
    const ordersChange = prevOrders > 0
      ? ((currOrders - prevOrders) / prevOrders) * 100
      : (currOrders > 0 ? 100 : 0);

    const couriersCount = stats.activeDrivers ?? onlineCouriersCount;

    return [
      {
        title: "Total Revenue",
        value: `${
          stats.totalRevenue?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) || "0.00"
        } ETB`,
        icon: FiDollarSign,
        change: Number(revenueChange.toFixed(1)),
        color: "#f97316",
        bgColor: "bg-primary-50 dark:bg-primary-950/40",
        textColor: "text-primary-600 dark:text-primary-400"
      },
      {
        title: "Total Orders",
        value: stats.totalOrders?.toLocaleString() || "0",
        icon: FiShoppingBag,
        change: Number(ordersChange.toFixed(1)),
        color: "#3b82f6",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400"
      },
      {
        title: "Active Couriers",
        value: `${couriersCount} Online`,
        subText: `${outForDeliveryCount} on active delivery`,
        icon: FiTruck,
        change: 12.5,
        color: "#10b981",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
        textColor: "text-emerald-600 dark:text-emerald-400"
      },
      {
        title: "Avg Fulfillment",
        value: stats.averageDeliveryTime
          ? `${Math.round(stats.averageDeliveryTime)} mins`
          : "24 mins",
        subText: "Door-to-door delivery",
        icon: FiClock,
        change: 3.2,
        color: "#475569",
        bgColor: "bg-slate-100 dark:bg-slate-800",
        textColor: "text-slate-700 dark:text-slate-300"
      }
    ];
  }, [state.stats, onlineCouriersCount, outForDeliveryCount]);

  const normalizedOrdersByStatus = useMemo(() => {
    const raw = state.stats?.ordersByStatus;
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map((item) => ({
        status: item?._id || item?.status || "unknown",
        count: Number(item?.count || 0),
        revenue: Number(item?.revenue || 0)
      }));
    }

    if (typeof raw === "object") {
      return Object.entries(raw).map(([status, count]) => ({
        status,
        count: Number(count || 0),
        revenue: 0
      }));
    }

    return [];
  }, [state.stats]);

  const normalizedPopularCategories = useMemo(() => {
    const raw = state.stats?.popularCategories;
    if (!Array.isArray(raw)) return [];
    return raw.map((cat) => ({
      name: cat?.name || cat?._id || "Unknown",
      count: Number(cat?.count || 0),
      percentage: Number(cat?.percentage || 0)
    }));
  }, [state.stats]);

  const normalizedPeakHours = useMemo(() => {
    const raw = state.stats?.peakHours;
    if (!Array.isArray(raw)) return [];
    return raw.map((hour) => ({
      hour: hour?.hour ?? hour?._id ?? 0,
      count: Number(hour?.count || 0),
      percentage: Number(hour?.percentage || 0)
    }));
  }, [state.stats]);

  const normalizedRecentActivity = useMemo(() => {
    const raw = state.stats?.recentActivity;
    if (!Array.isArray(raw)) return [];
    return raw.map((activity) => ({
      type: activity?.type || "order",
      message: typeof activity?.message === "string" ? activity.message : activity?.action || "Activity",
      timestamp: activity?.timestamp || activity?.createdAt || new Date().toISOString()
    }));
  }, [state.stats]);

  const normalizedTopSellingFoods = useMemo(() => {
    const raw = state.stats?.topSellingFoods;
    const foods = Array.isArray(state.foods) ? state.foods : [];

    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item, idx) => {
        const match = foods.find(
          (f) =>
            f.name?.toLowerCase() === (item?.name || item?._id || "").toLowerCase() ||
            f._id === item?._id
        );
        return {
          _id: match?._id || item?._id || String(idx),
          name: item?.name || match?.name || "Specialty Item",
          image: match?.image || null,
          category: match?.category || "Specialty",
          orders: Number(item?.quantity ?? item?.count ?? match?.orderCount ?? 0),
          revenue: Number(
            item?.revenue || (match?.price ? match.price * (item?.quantity || 1) : 0)
          )
        };
      });
    }

    return foods.slice(0, 5).map((f) => ({
      _id: f._id,
      name: f.name,
      image: f.image,
      category: f.category || "Specialty",
      orders: f.orderCount || f.stats?.orderCount || 0,
      revenue: (f.price || 0) * (f.orderCount || 0)
    }));
  }, [state.stats?.topSellingFoods, state.foods]);

  const statusDistribution = useMemo(() => {
    const totalOrders = Number(state.stats?.totalOrders || 0);
    if (!normalizedOrdersByStatus.length) return [];
    return normalizedOrdersByStatus.map((item) => ({
      status: item.status,
      count: item.count,
      percentage: totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : "0.0"
    }));
  }, [state.stats, normalizedOrdersByStatus]);

  if (isLoading("stats") && !state.stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 dark:border-orange-900/30 border-t-primary-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading dashboard analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Header and Controls */}
      <DashboardHeader
        selectedDateRange={selectedDateRange}
        handleDateRangeChange={handleDateRangeChange}
        showQuickActions={showQuickActions}
        setShowQuickActions={setShowQuickActions}
        handleExport={handleExport}
        refreshData={refreshData}
        isLoadingStats={isLoading("stats")}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />

      {/* Error Alert Display */}
      <AnimatePresence>
        {getError("stats") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {getError("stats")}
            </span>
            <button
              onClick={refreshData}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Metric Cards */}
      <DashboardMetricCards metrics={metrics} />

      {/* Real-Time Live Operations Pulse Strip */}
      <motion.div variants={itemVariants}>
        <LiveOperationsPulse
          activeOrdersCount={activeOrdersCount}
          kitchenOrdersCount={kitchenOrdersCount}
          outForDeliveryCount={outForDeliveryCount}
          pendingOrdersCount={pendingOrdersCount}
        />
      </motion.div>

      {/* Quick Report Insights */}
      <motion.div variants={itemVariants}>
        <QuickReportInsights />
      </motion.div>

      {/* View Switcher: Live Dispatch Operations vs Analytics */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl">
          <button
            onClick={() => handleTabChange("operations")}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === "operations"
                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <FiActivity className="w-4 h-4" />
            <span>Live Dispatch Operations</span>
          </button>

          <button
            onClick={() => handleTabChange("analytics")}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === "analytics"
                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FiPieChart className="w-4 h-4" />
            <span>Executive Analytics & Trends</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-3 py-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time WebSocket active</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "operations" ? (
          <motion.div
            key="operations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <LiveOperationsCenter />
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Order Status Distribution Pills */}
            <motion.div variants={itemVariants}>
              <OrderStatusDistribution statusDistribution={statusDistribution} />
            </motion.div>

            {/* Charts Section: Revenue Insights & Order Distribution */}
            <motion.div variants={itemVariants}>
              <DashboardChartsSection
                selectedDateRange={selectedDateRange}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                revenueByDay={state.stats?.revenueByDay}
                normalizedOrdersByStatus={normalizedOrdersByStatus}
              />
            </motion.div>

            {/* Top Selling Food Items & Recent Orders */}
            <motion.div variants={itemVariants}>
              <RecentOrdersAndTopSelling
                normalizedTopSellingFoods={normalizedTopSellingFoods}
                recentOrders={Array.isArray(state.orders) ? state.orders : []}
                onViewAllFoods={() => navigate("/admin/foods")}
                onViewAllOrders={() => navigate("/admin/orders")}
              />
            </motion.div>

            {/* Quick Stats: Popular Categories, Peak Hours, Recent Activity */}
            <motion.div variants={itemVariants}>
              <QuickStatsRow
                normalizedPopularCategories={normalizedPopularCategories}
                normalizedPeakHours={normalizedPeakHours}
                normalizedRecentActivity={normalizedRecentActivity}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardPage;
