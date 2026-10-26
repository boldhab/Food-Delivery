import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiPlus,
  FiTag,
  FiActivity,
  FiZap
} from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }
};

const DashboardHeader = ({
  selectedDateRange,
  handleDateRangeChange,
  showQuickActions,
  setShowQuickActions,
  handleExport,
  refreshData,
  isLoadingStats,
  lastUpdated,
  autoRefresh,
  setAutoRefresh
}) => {
  const navigate = useNavigate();
  const [rushModeActive, setRushModeActive] = useState(() => {
    return localStorage.getItem('admin_rush_mode') === 'true';
  });

  const toggleRushMode = () => {
    const nextState = !rushModeActive;
    setRushModeActive(nextState);
    localStorage.setItem('admin_rush_mode', String(nextState));
    if (nextState) {
      toast.success('⚡ Rush Mode Activated: +15 mins added to delivery ETA estimates for customers', {
        duration: 4000
      });
    } else {
      toast('Rush Mode Deactivated: Normal fulfillment estimates restored', {
        icon: '✓'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-sm text-muted-foreground mt-1"
          >
            Real-time business performance, fulfillment radar, and sales intelligence.
          </motion.p>
        </div>

        {/* Controls: Date Picker, Export, Refresh */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-2.5 self-start md:self-auto"
        >
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={selectedDateRange.label}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="h-9 pl-9 pr-4 bg-card border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-2xs"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="h-9 px-3.5 bg-card border border-border rounded-xl text-foreground hover:border-primary/50 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <FiDownload className="w-4 h-4 text-primary" />
              <span>Export</span>
            </button>

            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-44 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-20"
                >
                  {['csv', 'excel', 'pdf'].map((formatType) => (
                    <button
                      key={formatType}
                      onClick={() => {
                        handleExport(formatType);
                        setShowQuickActions(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <FiDownload className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="uppercase font-semibold tracking-wider">
                        {formatType} File
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoadingStats}
            className="h-9 px-3.5 bg-primary hover:bg-primary-700 text-white rounded-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </motion.div>
      </div>

      {/* Quick Actions Command Strip */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-2xl border border-border shadow-xs"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider mr-1">
            Quick Actions:
          </span>

          {/* New Food Dish */}
          <button
            type="button"
            onClick={() => navigate('/admin/foods/add')}
            className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/40"
          >
            <FiPlus className="w-3.5 h-3.5 text-primary" />
            <span>New Food Item</span>
          </button>

          {/* Create Promo */}
          <button
            type="button"
            onClick={() => navigate('/admin/promotions')}
            className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/40"
          >
            <FiTag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Create Promo Deal</span>
          </button>

          {/* Open Dispatch Radar */}
          <button
            type="button"
            onClick={() => navigate('/admin/dispatch')}
            className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/40"
          >
            <FiActivity className="w-3.5 h-3.5 text-blue-500" />
            <span>Dispatch Center</span>
          </button>

          {/* Rush Mode Toggle */}
          <button
            type="button"
            onClick={toggleRushMode}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              rushModeActive
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground border border-border/40'
            }`}
            title="Click to toggle rush hour delivery delay offset"
          >
            <FiZap className={`w-3.5 h-3.5 ${rushModeActive ? 'text-white' : 'text-amber-500'}`} />
            <span>{rushModeActive ? 'Rush Mode: ON (+15m)' : 'Rush Mode'}</span>
          </button>
        </div>

        {/* Last Updated & Auto-refresh status */}
        <div className="flex items-center gap-2 text-2xs text-slate-500 tabular-nums">
          <FiClock className="w-3 h-3 text-slate-400" />
          <span>Sync: {format(lastUpdated, 'h:mm:ss a')}</span>
          <label className="flex items-center gap-1 ml-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3 text-primary-600 rounded"
            />
            <span className="text-2xs text-slate-400">Auto (30s)</span>
          </label>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHeader;
