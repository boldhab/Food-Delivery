import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiClock,
  FiShare2,
  FiFileText
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import adminReportService from '../services/adminReportService';

// Subcomponents
import ReportFilters, { dateRangeOptions } from './reports/components/ReportFilters';
import SalesReport, { chartTypeOptions } from './reports/components/SalesReport';
import InventoryReport from './reports/components/InventoryReport';
import DriverReport from './reports/components/DriverReport';
import SlaReport from './reports/components/SlaReport';
import FinancialReport from './reports/components/FinancialReport';
import ScheduleModal from './reports/components/ScheduleModal';
import { exportReport } from '../utils/reportExport';

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

const reportTypes = [
  { id: 'sales', label: 'Sales & Revenue', icon: FiDollarSign, color: 'orange' },
  { id: 'inventory', label: 'Inventory & Stock', icon: FiPackage, color: 'emerald' },
  { id: 'drivers', label: 'Driver Analytics', icon: FiUsers, color: 'purple' },
  { id: 'sla', label: 'Delivery SLA & Logistics', icon: FiClock, color: 'blue' },
  { id: 'financial', label: 'Financial & COD Reconciliation', icon: FiFileText, color: 'amber' }
];

const ROUTE_TAB_MAP = {
  '/admin/reports/sales': 'sales',
  '/admin/reports/inventory': 'inventory',
  '/admin/reports/drivers': 'drivers',
  '/admin/reports/sla': 'sla',
  '/admin/reports/financial': 'financial',
  '/admin/reports/revenue': 'sales',
  '/admin/reports/users': 'drivers'
};

const ReportsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    return ROUTE_TAB_MAP[location.pathname] || 'sales';
  };

  const [activeReport, setActiveReport] = useState(getInitialTab);

  useEffect(() => {
    const routeTab = ROUTE_TAB_MAP[location.pathname];
    if (routeTab && routeTab !== activeReport) {
      setActiveReport(routeTab);
    }
  }, [location.pathname]);

  const handleTabChange = (typeId) => {
    setActiveReport(typeId);
    navigate(`/admin/reports/${typeId}`);
  };
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [comparison, setComparison] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    customStart: '',
    customEnd: '',
    category: 'all',
    status: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: ''
  });

  const [scheduledReports, setScheduledReports] = useState([
    {
      id: '1',
      name: 'Daily Sales Report',
      frequency: 'daily',
      format: 'pdf',
      recipients: ['admin@foodiehub.com'],
      nextSend: 'Tomorrow at 09:00 AM',
      lastSent: 'Today at 09:00 AM'
    }
  ]);

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'daily',
    format: 'pdf',
    recipients: []
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await adminReportService.getReportData(activeReport, filters);
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [
    activeReport,
    filters.dateRange,
    filters.customStart,
    filters.customEnd,
    filters.category,
    filters.status,
    filters.paymentMethod
  ]);

  const handleRefresh = () => {
    fetchReportData();
    toast.success('Report data refreshed');
  };

  const handleExport = (format) => {
    try {
      const msg = exportReport(activeReport, reportData, format, filters);
      toast.success(msg || `Exported ${activeReport} report as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(err.message || 'Failed to export report');
    }
  };

  const handleShareReport = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Report URL copied to clipboard');
  };

  const handleScheduleReport = () => {
    if (!newSchedule.name) {
      toast.error('Please enter a schedule name');
      return;
    }
    setScheduledReports([
      ...scheduledReports,
      {
        id: Date.now().toString(),
        ...newSchedule,
        nextSend: 'Tomorrow at 09:00 AM',
        lastSent: 'Never'
      }
    ]);
    setShowScheduleModal(false);
    toast.success('Report scheduled successfully');
  };

  const renderActiveReport = () => {
    if (!reportData) return null;

    switch (activeReport) {
      case 'sales':
        return (
          <SalesReport
            reportData={reportData}
            selectedChartType={selectedChartType}
            setSelectedChartType={setSelectedChartType}
            cardVariants={cardVariants}
            itemVariants={itemVariants}
          />
        );
      case 'inventory':
        return (
          <InventoryReport
            reportData={reportData}
            itemVariants={itemVariants}
            cardVariants={cardVariants}
          />
        );
      case 'drivers':
        return (
          <DriverReport
            reportData={reportData}
            itemVariants={itemVariants}
            cardVariants={cardVariants}
          />
        );
      case 'sla':
        return (
          <SlaReport
            reportData={reportData}
            itemVariants={itemVariants}
            cardVariants={cardVariants}
          />
        );
      case 'financial':
        return (
          <FinancialReport
            reportData={reportData}
            itemVariants={itemVariants}
            cardVariants={cardVariants}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Select a report type to view data
            </h3>
          </div>
        );
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate insights and analyze business performance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="h-9 px-3.5 bg-card border border-border rounded-xl text-foreground hover:border-primary/50 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
          >
            <FiClock className="w-4 h-4 text-muted-foreground" />
            <span>Schedule</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportModal(!showExportModal)}
              className="h-9 px-3.5 bg-card border border-border rounded-xl text-foreground hover:border-primary/50 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <FiDownload className="w-4 h-4 text-primary" />
              <span>Export</span>
            </button>

            <AnimatePresence>
              {showExportModal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-10"
                >
                  {[
                    { format: 'pdf', label: 'PDF Document' },
                    { format: 'excel', label: 'Excel Spreadsheet' },
                    { format: 'csv', label: 'CSV File' }
                  ].map((item) => (
                    <button
                      key={item.format}
                      onClick={() => {
                        handleExport(item.format);
                        setShowExportModal(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <FiDownload className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="h-9 px-3.5 bg-primary hover:bg-primary-700 text-white rounded-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Report Type Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTabChange(type.id)}
            className={`h-8 px-3.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer ${
              activeReport === type.id
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
            }`}
          >
            <type.icon className="w-3.5 h-3.5" />
            {type.label}
          </button>
        ))}
      </motion.div>

      {/* Filter Panel */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
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
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Share Report"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <ReportFilters
              filters={filters}
              setFilters={setFilters}
              comparison={comparison}
              setComparison={setComparison}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Report Content */}
      <motion.div variants={itemVariants} className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-80">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-200 dark:border-orange-900/30 border-t-primary-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-primary-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          renderActiveReport()
        )}
      </motion.div>

      {/* Scheduled Reports List */}
      {scheduledReports.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Scheduled Reports
          </h2>
          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
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
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        showScheduleModal={showScheduleModal}
        setShowScheduleModal={setShowScheduleModal}
        newSchedule={newSchedule}
        setNewSchedule={setNewSchedule}
        handleScheduleReport={handleScheduleReport}
        cardVariants={cardVariants}
      />
    </motion.div>
  );
};

export default ReportsPage;
