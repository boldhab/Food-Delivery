import React, { useState } from 'react';
import { DataTable, DataTableTextCell, DataTableNumericCell } from '../../../components/common/DataTable';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiTruck,
  FiCoffee,
  FiActivity
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

const SlaReport = ({ reportData, itemVariants, cardVariants }) => {
  const kpis = reportData?.kpis || {};
  const cycleStages = reportData?.cycleStages || [];
  const hourlyDelays = reportData?.hourlyDelays || [];
  const delayedOrders = reportData?.delayedOrders || [];

  const onTimeRate = Number(kpis.onTimeRate ?? 95).toFixed(1);
  const avgFulfillment = kpis.avgFulfillmentMinutes ?? 32;
  const avgPrep = kpis.avgPrepMinutes ?? 18;
  const avgTransit = kpis.avgTransitMinutes ?? 14;
  const delayedCount = kpis.delayedOrdersCount ?? delayedOrders.length;

  // Dynamic SLA bar percentages
  const slaCycleTotal = 3 + avgPrep + avgTransit;
  const dispatchPct = Math.round((3 / slaCycleTotal) * 100);
  const prepPct = Math.round((avgPrep / slaCycleTotal) * 100);
  const transitPct = 100 - dispatchPct - prepPct;

  // Delayed orders severity filter
  const [severityFilter, setSeverityFilter] = useState('all');
  const severityThresholds = { all: 0, '>45m': 45, '>60m': 60, '>90m': 90 };
  const filteredDelayedOrders = delayedOrders.filter(
    (ord) => ord.durationMinutes > severityThresholds[severityFilter]
  );

  // DataTable column definitions for delayed orders
  const delayedOrdersColumns = [
    {
      key: 'orderNumber',
      title: 'Order #',
      sortable: false,
      render: (val) => <DataTableTextCell value={`#${val}`} />,
    },
    {
      key: 'customerName',
      title: 'Customer',
      sortable: true,
      render: (val) => <DataTableTextCell value={val} />,
    },
    {
      key: 'driverName',
      title: 'Driver',
      sortable: false,
      render: (val) => <DataTableTextCell value={val} />,
    },
    {
      key: 'durationMinutes',
      title: 'Duration',
      sortable: true,
      align: 'right',
      render: (val) => (
        <DataTableNumericCell
          value={val}
          suffix=" mins"
          className={val > 60 ? 'text-rose-600 font-semibold' : ''}
        />
      ),
    },
    {
      key: 'excessMinutes',
      title: 'Excess',
      sortable: true,
      align: 'right',
      render: (val) => (
        <DataTableNumericCell
          value={val}
          suffix=" mins late"
          className="text-rose-600 font-semibold"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* SLA KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">On-Time Rate</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{onTimeRate}%</p>
            </div>
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Target: &le; 45 mins delivery</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Door-to-Door</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgFulfillment} mins</p>
            </div>
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FiClock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Total fulfillment cycle</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Kitchen Prep</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{avgPrep} mins</p>
            </div>
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <FiCoffee className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">From accept to courier pickup</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Delayed Deliveries</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{delayedCount}</p>
            </div>
            <div className="w-11 h-11 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-rose-500 mt-2">Breached 45-min SLA</p>
        </motion.div>
      </div>

      {/* Cycle Stage Breakdown */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Fulfillment Cycle Stage Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
            <div style={{ width: `${dispatchPct}%` }} className="bg-blue-500" title={`Order Processing (3m)`} />
            <div style={{ width: `${prepPct}%` }} className="bg-amber-500" title={`Kitchen Prep (${avgPrep}m)`} />
            <div style={{ width: `${transitPct}%` }} className="bg-emerald-500" title={`Courier Transit (${avgTransit}m)`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Dispatch / Confirmation</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">~3 mins ({dispatchPct}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Kitchen Cooking & Packaging</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">~{avgPrep} mins ({prepPct}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Courier Transit to Door</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">~{avgTransit} mins ({transitPct}%)</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hourly Delays & Delayed Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trend Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Fulfillment Duration by Hour
            </h3>
            <span className="text-xs text-slate-500">Avg Delivery Mins</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDelays} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${val} mins`, 'Avg Duration']} />
                <Bar dataKey="avgMinutes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Duration (m)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Delayed Deliveries Investigation Log */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Delayed Orders Log (&gt; 45 mins)
            </h3>
            <span className="text-xs text-rose-500 font-medium">{delayedOrders.length} incidents</span>
          </div>

          {/* Severity filter pills */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {['all', '>45m', '>60m', '>90m'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSeverityFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  severityFilter === key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-400'
                }`}
              >
                {key === 'all' ? 'All Delayed' : key}
              </button>
            ))}
          </div>

          <DataTable
            columns={delayedOrdersColumns}
            data={filteredDelayedOrders}
            rowKey={(ord) => ord.id || ord.orderNumber}
            storageKey="admin-sla-delayed-table"
            density="compact"
            emptyTitle="Zero delayed orders"
            emptyMessage="All deliveries met the 45-minute SLA in this period."
            hidePagination={filteredDelayedOrders.length <= 10}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SlaReport;
