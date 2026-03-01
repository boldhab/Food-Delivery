import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiClock,
  FiStar,
  FiCreditCard,
  FiShare2,
  FiAlertCircle,
  FiFileText,
  FiActivity,
  FiTarget,
  FiZap
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import adminReportService from "../services/adminReportService";
import { useAdminDataContext } from "../context/AdminDataContext";
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};
const ReportsPage = () => {
  const { isLoading, getError } = useAdminDataContext();
  const [activeReport, setActiveReport] = useState("sales");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState("line");
  const [comparison, setComparison] = useState(false);
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "last30days",
    customStart: "",
    customEnd: "",
    category: "all",
    status: "all",
    paymentMethod: "all",
    minAmount: "",
    maxAmount: ""
  });
  const [scheduledReports, setScheduledReports] = useState([
    {
      id: "1",
      name: "Daily Sales Report",
      type: "sales",
      frequency: "daily",
      recipients: ["admin@foodiehub.com"],
      format: "pdf",
      lastSent: format(subDays(/* @__PURE__ */ new Date(), 1), "yyyy-MM-dd"),
      nextSend: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
    },
    {
      id: "2",
      name: "Weekly Performance Report",
      type: "performance",
      frequency: "weekly",
      recipients: ["admin@foodiehub.com", "managers@foodiehub.com"],
      format: "excel",
      lastSent: format(subDays(/* @__PURE__ */ new Date(), 7), "yyyy-MM-dd"),
      nextSend: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
    }
  ]);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    type: "sales",
    frequency: "daily",
    recipients: [],
    format: "pdf"
  });
  useEffect(() => {
    loadReportData();
  }, [activeReport, filters]);
  const loadReportData = async () => {
    setLoading(true);
    try {
      let data;
      const params = buildReportParams();
      switch (activeReport) {
        case "sales":
          data = await adminReportService.getSalesReport(params);
          break;
        case "inventory":
          data = await adminReportService.getInventoryReport(params);
          break;
        case "users":
          data = await adminReportService.getUserReport(params);
          break;
        case "drivers":
          data = await adminReportService.getDriverReport(params);
          break;
        case "financial":
          data = await adminReportService.getFinancialReport(params);
          break;
        case "analytics":
          data = await adminReportService.getAnalyticsReport(params);
          break;
        default:
          data = await adminReportService.getSalesReport(params);
      }
      setReportData(data);
      if (comparison) {
        const previousParams = buildPreviousPeriodParams();
        const previousData = await adminReportService.getSalesReport(previousParams);
        setPreviousPeriodData(previousData);
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };
  const buildReportParams = () => {
    const params = {};
    if (filters.dateRange !== "custom") {
      const { start, end } = getDateRangeFromPreset(filters.dateRange);
      params.startDate = format(start, "yyyy-MM-dd");
      params.endDate = format(end, "yyyy-MM-dd");
    } else {
      if (filters.customStart) params.startDate = filters.customStart;
      if (filters.customEnd) params.endDate = filters.customEnd;
    }
    if (filters.category !== "all") params.category = filters.category;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    return params;
  };
  const buildPreviousPeriodParams = () => {
    const params = buildReportParams();
    const { start, end } = getDateRangeFromPreset(filters.dateRange);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24));
    params.startDate = format(subDays(start, daysDiff), "yyyy-MM-dd");
    params.endDate = format(subDays(end, daysDiff), "yyyy-MM-dd");
    return params;
  };
  const getDateRangeFromPreset = (preset) => {
    const now = /* @__PURE__ */ new Date();
    let start, end = now;
    switch (preset) {
      case "today":
        start = now;
        break;
      case "yesterday":
        start = subDays(now, 1);
        end = subDays(now, 1);
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
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case "last3months":
        start = subMonths(now, 3);
        break;
      case "last6months":
        start = subMonths(now, 6);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = subDays(now, 30);
    }
    return { start, end, label: preset };
  };
  const handleRefresh = () => {
    loadReportData();
    toast.success("Report refreshed");
  };
  const handleExport = async (format2) => {
    try {
      switch (format2) {
        case "pdf":
          await exportAsPDF();
          break;
        case "excel":
          await exportAsExcel();
          break;
        case "csv":
          await exportAsCSV();
          break;
        case "image":
          await exportAsImage();
          break;
      }
      toast.success(`Report exported as ${format2.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export as ${format2}`);
    }
  };
  const exportAsPDF = async () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${activeReport}-report-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.pdf`);
  };
  const exportAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formatDataForExcel());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${activeReport}-report-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.xlsx`);
  };
  const exportAsCSV = () => {
    const ws = XLSX.utils.json_to_sheet(formatDataForExcel());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };
  const exportAsImage = async () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    const canvas = await html2canvas(element);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.png`;
    a.click();
  };
  const formatDataForExcel = () => {
    if (!reportData) return [];
    switch (activeReport) {
      case "sales":
        return reportData.salesData.map((item) => ({
          Date: item.date,
          Revenue: item.revenue,
          Orders: item.orders
        }));
      case "inventory":
        return reportData.inventoryAlerts.map((item) => ({
          Item: item.item,
          "Current Stock": item.current,
          Threshold: item.threshold,
          Status: item.current <= item.threshold ? "Low" : "OK"
        }));
      default:
        return [];
    }
  };
  const handleScheduleReport = () => {
    const report = {
      id: Date.now().toString(),
      name: newSchedule.name || `${activeReport} Report`,
      type: activeReport,
      frequency: newSchedule.frequency,
      recipients: newSchedule.recipients || [],
      format: newSchedule.format,
      nextSend: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
    };
    setScheduledReports([...scheduledReports, report]);
    setShowScheduleModal(false);
    toast.success("Report scheduled successfully");
  };
  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Report link copied to clipboard");
  };
  const reportTypes = [
    { id: "sales", label: "Sales Report", icon: FiDollarSign, color: "orange" },
    { id: "inventory", label: "Inventory Report", icon: FiPackage, color: "blue" },
    { id: "users", label: "User Analytics", icon: FiUsers, color: "green" },
    { id: "drivers", label: "Driver Performance", icon: FiZap, color: "purple" },
    { id: "financial", label: "Financial Summary", icon: FiCreditCard, color: "red" },
    { id: "analytics", label: "Advanced Analytics", icon: FiActivity, color: "pink" }
  ];
  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last3months", label: "Last 3 Months" },
    { value: "last6months", label: "Last 6 Months" },
    { value: "thisYear", label: "This Year" },
    { value: "custom", label: "Custom Range" }
  ];
  const chartTypeOptions = [
    { value: "line", label: "Line Chart", icon: FiTrendingUp },
    { value: "bar", label: "Bar Chart", icon: FiBarChart2 },
    { value: "area", label: "Area Chart", icon: FiActivity },
    { value: "pie", label: "Pie Chart", icon: FiPieChart }
  ];
  const FilterPanel = () => <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="overflow-hidden"
  >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {
    /* Date Range */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Date Range
                        </label>
                        <select
    value={filters.dateRange}
    onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
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
                    {filters.dateRange === "custom" && <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Start Date
                                </label>
                                <input
    type="date"
    value={filters.customStart}
    onChange={(e) => setFilters((prev) => ({ ...prev, customStart: e.target.value }))}
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
    value={filters.customEnd}
    onChange={(e) => setFilters((prev) => ({ ...prev, customEnd: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
  />
                            </div>
                        </>}

                    {
    /* Category Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Category
                        </label>
                        <select
    value={filters.category}
    onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="all">All Categories</option>
                            <option value="pizza">Pizza</option>
                            <option value="burger">Burger</option>
                            <option value="sushi">Sushi</option>
                        </select>
                    </div>

                    {
    /* Status Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Status
                        </label>
                        <select
    value={filters.status}
    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
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
    value={filters.paymentMethod}
    onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="all">All Methods</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="cash">Cash</option>
                        </select>
                    </div>

                    {
    /* Amount Range */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Min Amount
                        </label>
                        <input
    type="number"
    value={filters.minAmount}
    onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
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
    value={filters.maxAmount}
    onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
    placeholder="1000"
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  />
                    </div>
                </div>

                {
    /* Comparison Toggle */
  }
                <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm">
                        <input
    type="checkbox"
    checked={comparison}
    onChange={(e) => setComparison(e.target.checked)}
    className="w-4 h-4 text-orange-500 rounded"
  />
                        Compare with previous period
                    </label>
                </div>
            </div>
        </motion.div>;
  const renderReport = () => {
    if (!reportData) return null;
    switch (activeReport) {
      case "sales":
        return <div className="space-y-6">
                        {
          /* KPI Cards */
        }
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Revenue</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            ${reportData.salesData?.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <FiDollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-green-500 mt-2">↑ 12.5% vs last period</p>
                            </motion.div>

                            <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Orders</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {reportData.salesData?.reduce((sum, d) => sum + d.orders, 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <FiShoppingBag className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-blue-500 mt-2">↑ 8.3% vs last period</p>
                            </motion.div>

                            <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            ${(reportData.salesData?.reduce((sum, d) => sum + d.revenue, 0) / reportData.salesData?.reduce((sum, d) => sum + d.orders, 0)).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                        <FiTrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-purple-500 mt-2">↑ 5.2% vs last period</p>
                            </motion.div>

                            <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Conversion Rate</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">68.5%</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        <FiTarget className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-orange-500 mt-2">↑ 3.1% vs last period</p>
                            </motion.div>
                        </div>

                        {
          /* Main Chart */
        }
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Revenue & Orders Trend
                                </h3>
                                <div className="flex items-center gap-2">
                                    {chartTypeOptions.map((option) => <button
          key={option.value}
          onClick={() => setSelectedChartType(option.value)}
          className={`p-2 rounded-lg transition-colors ${selectedChartType === option.value ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-orange-500"}`}
        >
                                            <option.icon className="w-4 h-4" />
                                        </button>)}
                                </div>
                            </div>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {selectedChartType === "line" && <LineChart data={reportData.salesData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fill: "#64748b" }} />
                                            <YAxis yAxisId="left" tick={{ fill: "#64748b" }} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
                                            <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
                                        </LineChart>}
                                    {selectedChartType === "bar" && <BarChart data={reportData.salesData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fill: "#64748b" }} />
                                            <YAxis tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>}
                                    {selectedChartType === "area" && <AreaChart data={reportData.salesData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fill: "#64748b" }} />
                                            <YAxis tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Legend />
                                            <Area
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.2}
        />
                                            <Area
          type="monotone"
          dataKey="orders"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
        />
                                        </AreaChart>}
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {
          /* Secondary Charts Grid */
        }
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {
          /* Top Selling Items */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Top Selling Items
                                </h3>
                                <div className="space-y-4">
                                    {reportData.topSellingItems?.map((item, index) => <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {item.count} sold
                                                </span>
                                                <span className="text-sm text-green-600">
                                                    ${item.revenue.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>)}
                                </div>
                            </motion.div>

                            {
          /* Category Distribution */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Category Distribution
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
          data={reportData.categoryDistribution}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="count"
          label
        >
                                                {reportData.categoryDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {
          /* Hourly Orders */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Orders by Hour
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.hourlyOrders}>
                                            <XAxis dataKey="hour" tick={{ fill: "#64748b" }} />
                                            <YAxis tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {
          /* Payment Methods */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Payment Methods
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
          data={reportData.paymentMethodDistribution}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="count"
          label
        >
                                                {reportData.paymentMethodDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </div>;
      case "inventory":
        return <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {
          /* Inventory Alerts */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Low Stock Alerts
                                </h3>
                                <div className="space-y-4">
                                    {reportData.inventoryAlerts?.map((item) => <div key={item.item} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{item.item}</p>
                                                <p className="text-sm text-slate-500">Current: {item.current} / Threshold: {item.threshold}</p>
                                            </div>
                                            <FiAlertCircle className="w-5 h-5 text-red-500" />
                                        </div>)}
                                </div>
                            </motion.div>

                            {
          /* Stock Levels */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Stock Levels
                                </h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.inventoryAlerts}>
                                            <XAxis dataKey="item" tick={{ fill: "#64748b" }} />
                                            <YAxis tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Bar dataKey="current" fill="#f97316" />
                                            <Bar dataKey="threshold" fill="#94a3b8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </div>;
      case "drivers":
        return <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {
          /* Driver Performance */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Driver Performance
                                </h3>
                                <div className="space-y-4">
                                    {reportData.driverPerformance?.map((driver) => <div key={driver.driver} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{driver.driver}</p>
                                                <p className="text-sm text-slate-500">{driver.deliveries} deliveries</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-medium">{driver.rating.toFixed(1)}</span>
                                                </div>
                                                <p className="text-sm text-green-600">${driver.earnings.toFixed(2)}</p>
                                            </div>
                                        </div>)}
                                </div>
                            </motion.div>

                            {
          /* Earnings Chart */
        }
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Driver Earnings
                                </h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.driverPerformance}>
                                            <XAxis dataKey="driver" tick={{ fill: "#64748b" }} />
                                            <YAxis tick={{ fill: "#64748b" }} />
                                            <Tooltip />
                                            <Bar dataKey="earnings" fill="#f97316" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </div>;
      default:
        return <div className="text-center py-12">
                        <FiFileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                            Select a report type to view data
                        </h3>
                    </div>;
    }
  };
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
                        Reports & Analytics
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Generate insights and analyze business performance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {
    /* Schedule Report */
  }
                    <button
    onClick={() => setShowScheduleModal(true)}
    className="px-4 py-2 bg-white dark:bg-slate-800
                                 border border-slate-200 dark:border-slate-700
                                 rounded-xl text-slate-700 dark:text-slate-300
                                 hover:border-orange-500 transition-colors
                                 flex items-center gap-2"
  >
                        <FiClock className="w-4 h-4" />
                        <span>Schedule</span>
                    </button>

                    {
    /* Export Dropdown */
  }
                    <div className="relative">
                        <button
    onClick={() => setShowExportModal(!showExportModal)}
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
                            {showExportModal && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                             overflow-hidden z-10"
  >
                                    {[
    { format: "pdf", label: "PDF Document" },
    { format: "excel", label: "Excel Spreadsheet" },
    { format: "csv", label: "CSV File" },
    { format: "image", label: "Image (PNG)" }
  ].map((item) => <button
    key={item.format}
    onClick={() => {
      handleExport(item.format);
      setShowExportModal(false);
    }}
    className="w-full px-4 py-3 text-left text-sm
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2"
  >
                                            <FiDownload className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </button>)}
                                </motion.div>}
                        </AnimatePresence>
                    </div>

                    {
    /* Refresh Button */
  }
                    <button
    onClick={handleRefresh}
    disabled={loading}
    className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-xl transition-colors
                                 flex items-center gap-2 shadow-lg shadow-orange-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed"
  >
                        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </motion.div>

            {
    /* Report Type Tabs */
  }
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {reportTypes.map((type) => <button
    key={type.id}
    onClick={() => setActiveReport(type.id)}
    className={`
                            px-4 py-2 rounded-xl font-medium text-sm
                            transition-all duration-200
                            flex items-center gap-2
                            ${activeReport === type.id ? `bg-${type.color}-500 text-white shadow-lg shadow-${type.color}-500/25` : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500"}
                        `}
  >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                    </button>)}
            </motion.div>

            {
    /* Filters */
  }
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <button
    onClick={() => setShowFilters(!showFilters)}
    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
  >
                        <FiFilter className="w-4 h-4" />
                        <span>Report Filters</span>
                        <FiCalendar className="w-4 h-4 ml-2" />
                        <span className="text-sm text-slate-500">
                            {dateRangeOptions.find((o) => o.value === filters.dateRange)?.label}
                        </span>
                    </button>
                    
                    <button
    onClick={handleShareReport}
    className="p-2 text-slate-500 hover:text-orange-500
                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                 rounded-lg transition-colors"
    title="Share Report"
  >
                        <FiShare2 className="w-4 h-4" />
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && <FilterPanel />}
                </AnimatePresence>
            </motion.div>

            {
    /* Report Content */
  }
            <motion.div
    id="report-content"
    variants={itemVariants}
    className="space-y-6"
  >
                {loading ? <div className="flex items-center justify-center min-h-[400px]">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900/30 
                                          border-t-orange-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FiBarChart2 className="w-6 h-6 text-orange-500 animate-pulse" />
                            </div>
                        </div>
                    </div> : renderReport()}
            </motion.div>

            {
    /* Scheduled Reports */
  }
            {scheduledReports.length > 0 && <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Scheduled Reports
                    </h2>
                    <div className="space-y-3">
                        {scheduledReports.map((report) => <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{report.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {report.frequency} • {report.format.toUpperCase()} • {report.recipients.length} recipients
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Next: {report.nextSend}</p>
                                    <p className="text-xs text-slate-400">Last: {report.lastSent}</p>
                                </div>
                            </div>)}
                    </div>
                </motion.div>}

            {
    /* Schedule Modal */
  }
            <AnimatePresence>
                {showScheduleModal && <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setShowScheduleModal(false)}
  >
                        <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
    onClick={(e) => e.stopPropagation()}
    className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
  >
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Schedule Report
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Report Name
                                    </label>
                                    <input
    type="text"
    value={newSchedule.name}
    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
    placeholder="e.g., Daily Sales Report"
    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900
                                                 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm"
  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Frequency
                                        </label>
                                        <select
    value={newSchedule.frequency}
    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900
                                                     border border-slate-200 dark:border-slate-700
                                                     rounded-lg text-sm"
  >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Format
                                        </label>
                                        <select
    value={newSchedule.format}
    onChange={(e) => setNewSchedule({ ...newSchedule, format: e.target.value })}
    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900
                                                     border border-slate-200 dark:border-slate-700
                                                     rounded-lg text-sm"
  >
                                            <option value="pdf">PDF</option>
                                            <option value="excel">Excel</option>
                                            <option value="csv">CSV</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Recipients (comma separated)
                                    </label>
                                    <input
    type="text"
    value={newSchedule.recipients?.join(", ")}
    onChange={(e) => setNewSchedule({
      ...newSchedule,
      recipients: e.target.value.split(",").map((email) => email.trim())
    })}
    placeholder="admin@example.com, manager@example.com"
    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900
                                                 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm"
  />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
    onClick={() => setShowScheduleModal(false)}
    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors"
  >
                                    Cancel
                                </button>
                                <button
    onClick={handleScheduleReport}
    className="flex-1 px-4 py-2 bg-orange-500 text-white
                                             rounded-lg text-sm hover:bg-orange-600
                                             transition-colors"
  >
                                    Schedule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>}
            </AnimatePresence>
        </motion.div>;
};
var stdin_default = ReportsPage;
export {
  stdin_default as default
};
