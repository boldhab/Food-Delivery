import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
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
} from 'recharts';
import {
  DataTable,
  DataTableTextCell,
  DataTableNumericCell
} from '../../../components/common/DataTable';

export const chartTypeOptions = [
  { value: 'line', label: 'Line Chart', icon: FiActivity },
  { value: 'bar', label: 'Bar Chart', icon: FiBarChart2 },
  { value: 'area', label: 'Area Chart', icon: FiPieChart }
];

const SalesReport = ({
  reportData,
  selectedChartType,
  setSelectedChartType,
  cardVariants,
  itemVariants
}) => {
  const [search, setSearch] = useState('');

  const kpis = reportData.kpis || {};
  const totalRevenue = kpis.totalRevenue !== undefined
    ? Number(kpis.totalRevenue)
    : (reportData.salesData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0);
  const totalOrders = kpis.totalOrders !== undefined
    ? Number(kpis.totalOrders)
    : (reportData.salesData?.reduce((sum, d) => sum + (d.orders || 0), 0) || 0);
  const avgOrderValue = kpis.avgOrderValue !== undefined
    ? Number(kpis.avgOrderValue).toFixed(2)
    : (totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00');
  const conversionRate = kpis.conversionRate !== undefined
    ? Number(kpis.conversionRate).toFixed(1)
    : (totalOrders > 0 ? '100.0' : '0.0');

  const renderTrend = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return <p className="text-xs text-slate-400 mt-2">Baseline period</p>;
    }
    const num = Number(value);
    const isPositive = num >= 0;
    return (
      <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span>{isPositive ? `+${num}%` : `${num}%`}</span>
        <span className="text-slate-400 font-normal">vs prior period</span>
      </p>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${Number(totalRevenue).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          {renderTrend(kpis.revenueChange)}
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          {renderTrend(kpis.ordersChange)}
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${avgOrderValue}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/60 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
          </div>
          {renderTrend(kpis.avgOrderValueChange)}
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Fulfillment Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/40 rounded-lg flex items-center justify-center">
              <FiTarget className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          {renderTrend(kpis.conversionRateChange)}
        </motion.div>
      </div>

      {/* Main Trend Chart */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Revenue & Orders Trend
          </h3>
          <div className="flex items-center gap-2">
            {chartTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedChartType(option.value)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedChartType === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-primary-600'
                }`}
                title={option.label}
              >
                <option.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChartType === 'line' && (
              <LineChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
            {selectedChartType === 'bar' && (
              <BarChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {selectedChartType === 'area' && (
              <AreaChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Selling Items
          </h3>
          <div className="space-y-4">
            {reportData.topSellingItems?.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.count} sold
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    ${Number(item.revenue || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                  label
                >
                  {reportData.categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hourly Orders */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Orders by Hour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.hourlyOrders}>
                <XAxis dataKey="hour" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Payment Methods
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.paymentMethodDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  label
                >
                  {reportData.paymentMethodDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Daily Sales Breakdown Table */}
      {(() => {
        const salesData = reportData.salesData || [];

        // Derive rows with avgOrderValue
        const tableData = salesData.map((row, idx) => ({
          ...row,
          _rowKey: row.date || idx,
          avgOrderValue:
            row.orders > 0
              ? (row.revenue / row.orders).toFixed(2)
              : '0.00'
        }));

        // Client-side filter by date string
        const filteredData = search.trim()
          ? tableData.filter((row) =>
              String(row.date || '').toLowerCase().includes(search.toLowerCase().trim())
            )
          : tableData;

        // Summary totals over full (unfiltered) dataset
        const totalOrdersSum = salesData.reduce((s, r) => s + (r.orders || 0), 0);
        const totalRevenueSum = salesData.reduce((s, r) => s + (r.revenue || 0), 0);
        const avgValues = tableData.map((r) => parseFloat(r.avgOrderValue));
        const avgOfAvg =
          avgValues.length > 0
            ? (avgValues.reduce((s, v) => s + v, 0) / avgValues.length).toFixed(2)
            : '0.00';

        const columns = [
          {
            key: 'date',
            title: 'Date',
            sortable: true,
            render: (val) => <DataTableTextCell value={val} />
          },
          {
            key: 'orders',
            title: 'Orders',
            sortable: true,
            align: 'right',
            render: (val) => <DataTableNumericCell value={val} />
          },
          {
            key: 'revenue',
            title: 'Revenue (ETB)',
            sortable: true,
            align: 'right',
            render: (val) => (
              <DataTableNumericCell
                value={val}
                format="currency"
                suffix=" ETB"
                decimals={2}
              />
            )
          },
          {
            key: 'avgOrderValue',
            title: 'Avg Order Value (ETB)',
            align: 'right',
            render: (val) => (
              <DataTableNumericCell
                value={parseFloat(val)}
                suffix=" ETB"
                decimals={2}
              />
            )
          }
        ];

        const summaryRow = (
          <tr>
            <td className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Totals
            </td>
            <td className="py-2 px-3 text-xs font-semibold text-right text-slate-700 dark:text-slate-200">
              {totalOrdersSum}
            </td>
            <td className="py-2 px-3 text-xs font-semibold text-right text-slate-700 dark:text-slate-200">
              ${Number(totalRevenueSum).toFixed(2)}
            </td>
            <td className="py-2 px-3 text-xs font-semibold text-right text-slate-700 dark:text-slate-200">
              ${avgOfAvg}
            </td>
          </tr>
        );

        return (
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Daily Sales Breakdown
              </h3>
            </div>
            <DataTable
              columns={columns}
              data={filteredData}
              rowKey="_rowKey"
              density="compact"
              storageKey="admin-sales-report-table"
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Filter by date…"
              summaryRow={summaryRow}
              hidePagination={filteredData.length <= 10}
            />
          </motion.div>
        );
      })()}
    </div>
  );
};

export default SalesReport;
