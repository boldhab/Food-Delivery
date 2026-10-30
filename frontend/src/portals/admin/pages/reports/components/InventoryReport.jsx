import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag
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
import { DataTable, DataTableTextCell, DataTableNumericCell } from '../../../components/common/DataTable';

const InventoryReport = ({ reportData, itemVariants }) => {
  const summary = reportData.summary || {};
  const alerts = reportData.inventoryAlerts || [];
  const items = reportData.items || alerts;

  const totalMenuItems = summary.totalMenuItems ?? items.length;
  const activeItems = summary.activeItems ?? items.filter((f) => f.isAvailable).length;
  const outOfStockCount = summary.outOfStockCount ?? items.filter((f) => !f.isAvailable).length;
  const lowVelocityCount = summary.lowVelocityCount ?? alerts.filter((f) => f.isAvailable && f.orderCount < 3).length;

  const [statusFilter, setStatusFilter] = useState('all');

  const getItemStatus = (item) =>
    !item.isAvailable ? 'Out of Stock' : item.orderCount < 3 ? 'Low Velocity' : 'In Stock';

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'all') return true;
    const status = getItemStatus(item);
    if (statusFilter === 'out_of_stock') return status === 'Out of Stock';
    if (statusFilter === 'low_velocity') return status === 'Low Velocity';
    if (statusFilter === 'in_stock') return status === 'In Stock';
    return true;
  });

  const inventoryColumns = [
    {
      key: 'item',
      title: 'Item Name',
      sortable: true,
      render: (val) => <DataTableTextCell value={val} />,
    },
    {
      key: 'category',
      title: 'Category',
      render: (val) => <DataTableTextCell value={val} muted />,
    },
    {
      key: 'price',
      title: 'Price (ETB)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <DataTableNumericCell
          value={Number(val || 0)}
          format="currency"
          currency="ETB"
          align="right"
        />
      ),
    },
    {
      key: 'orderCount',
      title: 'Weekly Orders',
      sortable: true,
      align: 'center',
      render: (val) => <DataTableNumericCell value={val ?? 0} align="center" />,
    },
    {
      key: '_status',
      title: 'Status',
      align: 'center',
      render: (_, item) => {
        const status = getItemStatus(item);
        const badgeClass =
          status === 'Out of Stock'
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            : status === 'Low Velocity'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
        return (
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${badgeClass}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{outOfStockCount}</p>
            </div>
            <div className="w-11 h-11 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
              <FiXCircle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-rose-500 mt-2">Kitchen items unavailable</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Demand Items</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{lowVelocityCount}</p>
            </div>
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">&lt; 3 orders in last 7 days</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Dishes</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {activeItems} / {totalMenuItems}
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active on public menu</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High Velocity Dishes</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{summary.highDemandCount || 0}</p>
            </div>
            <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700/60 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Top sellers &gt; 10 orders</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory & Velocity Attention Roster */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Menu Item Status & Velocity Alerts
              </h3>
              <span className="text-xs text-slate-500">{alerts.length} items flagged</span>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs font-medium text-slate-500 shrink-0">
                Filter by Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="all">All</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_velocity">Low Velocity</option>
                <option value="in_stock">In Stock</option>
              </select>
            </div>

            <DataTable
              columns={inventoryColumns}
              data={filteredItems}
              rowKey={(item, idx) => item.id ?? item.item ?? idx}
              storageKey="admin-inventory-report-table"
              density="compact"
              emptyMessage="No items match the selected filter."
              hidePagination={filteredItems.length <= 10}
            />
          </div>
        </motion.div>

        {/* Weekly Order Volume Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Menu Demand & Volume
            </h3>
            <span className="text-xs text-slate-500">Units sold in 7 days</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items.slice(0, 8)} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    val,
                    name === 'current' ? 'Units Sold' : 'Order Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="current" fill="#f97316" radius={[4, 4, 0, 0]} name="Units Sold" />
                <Bar dataKey="orderCount" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryReport;
