import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiClock,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiAlertCircle,
  FiX,
  FiLayers,
  FiExternalLink
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import adminReportService from '../../../services/adminReportService';
import SalesReport from '../../reports/components/SalesReport';
import InventoryReport from '../../reports/components/InventoryReport';
import DriverReport from '../../reports/components/DriverReport';
import SlaReport from '../../reports/components/SlaReport';
import FinancialReport from '../../reports/components/FinancialReport';

const REPORT_TABS = [
  {
    id: 'sales',
    label: 'Sales & Revenue',
    shortLabel: 'Sales',
    icon: FiDollarSign,
    color: 'orange',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    activeBg: 'bg-orange-500 text-white shadow-lg shadow-orange-500/25',
    activeTabClass: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800/50',
    ringColor: 'ring-orange-400/50',
    accentColor: '#f97316',
    description: 'Revenue, order volume, average ticket size & daily sales breakdown',
    getKpis: (data) => ([
      { label: 'Revenue', value: `${Number(data?.kpis?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` },
      { label: 'Orders', value: (data?.kpis?.totalOrders || 0).toLocaleString() }
    ]),
    getSparkData: (data) => (data?.salesData || []).slice(-14),
    sparkKey: 'revenue',
  },
  {
    id: 'inventory',
    label: 'Inventory & Stock',
    shortLabel: 'Inventory',
    icon: FiPackage,
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25',
    activeTabClass: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    ringColor: 'ring-emerald-400/50',
    accentColor: '#10b981',
    description: 'Menu item availability, low velocity dishes & reorder alerts',
    getKpis: (data) => ([
      { label: 'Active Items', value: data?.summary?.activeItems ?? 0 },
      { label: 'Out of Stock', value: data?.summary?.outOfStockCount ?? 0 }
    ]),
    getSparkData: (data) => (data?.items || data?.inventoryAlerts || []).slice(0, 10).map((it, i) => ({ i, v: it?.orderCount || 0 })),
    sparkKey: 'v',
  },
  {
    id: 'drivers',
    label: 'Driver Analytics',
    shortLabel: 'Drivers',
    icon: FiUsers,
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    activeBg: 'bg-purple-600 text-white shadow-lg shadow-purple-600/25',
    activeTabClass: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800/50',
    ringColor: 'ring-purple-400/50',
    accentColor: '#8b5cf6',
    description: 'Courier fleet capacity, ratings, delivery counts & payouts',
    getKpis: (data) => ([
      { label: 'Active Drivers', value: data?.fleetSummary?.activeDrivers ?? 0 },
      { label: 'Deliveries', value: data?.fleetSummary?.totalDeliveries ?? 0 }
    ]),
    getSparkData: (data) => (data?.driverPerformance || []).slice(0, 8).map((d, i) => ({ i, v: d?.deliveries || 0 })),
    sparkKey: 'v',
  },
  {
    id: 'sla',
    label: 'Delivery SLA',
    shortLabel: 'SLA Logistics',
    icon: FiClock,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    activeBg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/25',
    activeTabClass: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    ringColor: 'ring-blue-400/50',
    accentColor: '#3b82f6',
    description: 'On-time delivery performance, kitchen prep times & transit delays',
    getKpis: (data) => ([
      { label: 'On-Time Rate', value: `${Number(data?.kpis?.onTimeRate ?? 95).toFixed(1)}%` },
      { label: 'Avg Door-to-Door', value: `${data?.kpis?.avgFulfillmentMinutes ?? 30} mins` }
    ]),
    getSparkData: (data) => (data?.hourlyDelays || []).slice(0, 12),
    sparkKey: 'avgMinutes',
  },
  {
    id: 'financial',
    label: 'Financial & COD',
    shortLabel: 'Financial',
    icon: FiFileText,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    activeBg: 'bg-amber-600 text-white shadow-lg shadow-amber-600/25',
    activeTabClass: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    ringColor: 'ring-amber-400/50',
    accentColor: '#f59e0b',
    description: 'Gross volume, cashflow reconciliation & driver COD cash settlements',
    getKpis: (data) => ([
      { label: 'GMV', value: `${Number(data?.summary?.gmv || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` },
      { label: 'Platform Net', value: `${Number(data?.summary?.platformNetRevenue || 0).toFixed(2)} ETB` }
    ]),
    getSparkData: (data) => (data?.dailyCashflow || []).slice(-10),
    sparkKey: 'gmv',
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25 }
  }
};

const sharedProps = { itemVariants, cardVariants };

const QuickReportInsights = () => {
  const navigate = useNavigate();

  // Active expanded report tab ('sales' | 'inventory' | 'drivers' | 'sla' | 'financial' | null)
  const [activeReportId, setActiveReportId] = useState(null);

  // Display mode: 'navbar' (sleek sub-nav buttons) or 'cards' (mini metrics cards)
  const [displayMode, setDisplayMode] = useState('navbar');

  // Cache fetched report data
  const [reportCache, setReportCache] = useState({});

  // Loading state
  const [loadingId, setLoadingId] = useState(null);

  // Errors
  const [errors, setErrors] = useState({});

  // Selected chart type for Sales report
  const [selectedChartType, setSelectedChartType] = useState('line');

  // Handle clicking a report button in the navbar or card
  const handleSelectReport = useCallback(async (reportId, force = false) => {
    // If clicking the currently active report and not forcing refresh, collapse it
    if (!force && activeReportId === reportId) {
      setActiveReportId(null);
      return;
    }

    setActiveReportId(reportId);

    // If already cached, don't re-fetch unless forced
    if (!force && reportCache[reportId]) return;

    setLoadingId(reportId);
    setErrors((prev) => ({ ...prev, [reportId]: null }));
    try {
      const data = await adminReportService.getReportData(reportId, { dateRange: 'last30days' });
      setReportCache((prev) => ({ ...prev, [reportId]: data }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [reportId]: err?.message || 'Failed to load report' }));
    } finally {
      setLoadingId(null);
    }
  }, [activeReportId, reportCache]);

  const activeTabConfig = REPORT_TABS.find((t) => t.id === activeReportId);

  const renderActiveReportContent = (card) => {
    const data = reportCache[card.id];
    const isLoading = loadingId === card.id;
    const error = errors[card.id];

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          <span className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Generating {card.label} Analytics...
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Synthesizing charts, graphs, and performance metrics
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-between gap-4 p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-400 my-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-bold">Failed to load {card.label}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => handleSelectReport(card.id, true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data) return null;

    switch (card.id) {
      case 'sales':
        return (
          <SalesReport
            reportData={data}
            selectedChartType={selectedChartType}
            setSelectedChartType={setSelectedChartType}
            {...sharedProps}
          />
        );
      case 'inventory':
        return <InventoryReport reportData={data} {...sharedProps} />;
      case 'drivers':
        return <DriverReport reportData={data} {...sharedProps} />;
      case 'sla':
        return <SlaReport reportData={data} {...sharedProps} />;
      case 'financial':
        return <FinancialReport reportData={data} {...sharedProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 space-y-4">
      {/* Top Header Row with View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <FiBarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Instant Report Center
            </h2>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-9">
            Click any report button below to inspect live charts, graphs, and data tables inline
          </p>
        </div>

        {/* View Mode & Collapse Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto ml-9 sm:ml-0">
          {/* Mode Switcher: Navbar vs Cards */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDisplayMode('navbar')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'navbar'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Button Strip View"
            >
              <FiLayers className="w-3.5 h-3.5" />
              <span>Button Bar</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Overview Cards View"
            >
              <FiTrendingUp className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {/* Collapse button if a report is active */}
          {activeReportId && (
            <button
              type="button"
              onClick={() => setActiveReportId(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
              title="Close inline report view"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. REPORT NAVBAR BUTTON STRIP (Default, Requested by User)     */}
      {/* ────────────────────────────────────────────────────────────── */}
      {displayMode === 'navbar' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {REPORT_TABS.map((tab) => {
            const isActive = activeReportId === tab.id;
            const isLoading = loadingId === tab.id;
            const isCached = Boolean(reportCache[tab.id]);

            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => handleSelectReport(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative shrink-0 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? `${tab.activeBg} border-transparent ring-2 ${tab.ringColor}`
                    : `bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:${tab.borderColor}`
                }`}
              >
                {/* Icon or Loading Spinner */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : `${tab.bgColor} ${tab.iconColor}`
                  }`}
                >
                  {isLoading ? (
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <tab.icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Button Label */}
                <span className="whitespace-nowrap tracking-tight">{tab.label}</span>

                {/* Cached status indicator dot */}
                {isCached && !isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tab.accentColor }}
                    title="Data cached & ready"
                  />
                )}

                {/* Chevron icon indicating active expansion */}
                {isActive ? (
                  <FiChevronUp className="w-3.5 h-3.5 ml-1 opacity-80" />
                ) : (
                  <FiChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400 opacity-60" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. OVERVIEW CARDS VIEW (Optional alternative)                  */}
      {/* ────────────────────────────────────────────────────────────── */}
      {displayMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {REPORT_TABS.map((card) => {
            const cachedData = reportCache[card.id];
            const sparkData = cachedData ? card.getSparkData(cachedData) : [];
            const isActive = activeReportId === card.id;

            return (
              <motion.div
                key={card.id}
                onClick={() => handleSelectReport(card.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-2xl p-4 border cursor-pointer transition-all duration-200 ${
                  isActive
                    ? `${card.bgColor} ${card.borderColor} ring-2 ${card.ringColor}`
                    : `bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:${card.borderColor}`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bgColor}`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  {isActive ? (
                    <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-primary-500 text-white">Active</span>
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{card.label}</p>

                <div className="space-y-1">
                  {card.getKpis(cachedData || {}).map((kpi) => (
                    <div key={kpi.label} className="flex items-center justify-between text-2xs">
                      <span className="text-slate-400">{kpi.label}</span>
                      <span className={`font-bold ${cachedData ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {cachedData ? kpi.value : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {cachedData && sparkData.length > 1 && (
                  <div className="mt-2.5 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line
                          type="monotone"
                          dataKey={card.sparkKey}
                          stroke={card.accentColor}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. INLINE REPORT DISPLAY (Rendered when a report button is active) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeReportId && activeTabConfig && (
          <motion.div
            key={activeReportId}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden pt-2"
          >
            {/* Top Sub-Bar of the Active Report */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-t-2xl border border-b-0 ${activeTabConfig.bgColor} ${activeTabConfig.borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: activeTabConfig.accentColor }}
                >
                  <activeTabConfig.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeTabConfig.label}
                    </h3>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                      Inline Dashboard Preview
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTabConfig.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Refresh + Open Full Report */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleSelectReport(activeReportId, true)}
                  disabled={loadingId === activeReportId}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
                  title="Reload report data"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loadingId === activeReportId ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/reports/${activeReportId}`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-95 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: activeTabConfig.accentColor }}
                >
                  <span>Open Full Report</span>
                  <FiExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReportId(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/60 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  title="Close report preview"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Report Charts, Graphs, and Tables */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border rounded-b-2xl border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              {renderActiveReportContent(activeTabConfig)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickReportInsights;
