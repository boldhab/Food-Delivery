import React from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiTrendingUp,
  FiPieChart,
  FiArchive
} from 'react-icons/fi';
import {
  DataTable,
  DataTableTextCell,
  DataTableNumericCell
} from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/adminHelpers';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

const FinancialReport = ({ reportData, itemVariants, cardVariants }) => {
  const summary = reportData?.summary || {};
  const paymentBreakdown = reportData?.paymentBreakdown || {};
  const dailyCashflow = reportData?.dailyCashflow || [];
  const driverBalances = reportData?.driverCashBalances || [];

  const gmv = Number(summary.gmv || 0).toFixed(2);
  const platformNet = Number(summary.platformNetRevenue || 0).toFixed(2);
  const courierPayouts = Number(summary.courierPayouts || 0).toFixed(2);
  const cancelledLoss = Number(summary.cancelledLoss || 0).toFixed(2);

  const pieData = [
    { name: 'Online / Card', value: Number(paymentBreakdown.cardRevenue || 0), color: '#3b82f6' },
    { name: 'Cash on Delivery (COD)', value: Number(paymentBreakdown.codRevenue || 0), color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Spend (GMV)</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{gmv} ETB</p>
            </div>
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FiCreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{summary.totalOrders || 0} completed orders</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Platform Net Take</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{platformNet} ETB</p>
            </div>
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">15% fee + delivery margin</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Courier Payouts</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{courierPayouts} ETB</p>
            </div>
            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Delivery fees to fleet</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cancelled Order Loss</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{cancelledLoss} ETB</p>
            </div>
            <div className="w-11 h-11 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{summary.cancelledOrdersCount || 0} cancelled orders</p>
        </motion.div>
      </div>

      {/* Cashflow Trends & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Daily Cashflow & Revenue Velocity
            </h3>
            <span className="text-xs text-slate-500">Gross vs Net (ETB)</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCashflow} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${Number(val).toFixed(2)} ETB`]} />
                <Legend />
                <Line type="monotone" dataKey="gmv" stroke="#3b82f6" strokeWidth={2.5} name="Gross Spend" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="platformNet" stroke="#10b981" strokeWidth={2.5} name="Platform Net" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Payment Channels
            </h3>
            <p className="text-xs text-slate-500 mb-4">Online card vs Cash on delivery</p>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${Number(val).toFixed(2)} ETB`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300">Online Card</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {Number(paymentBreakdown.cardRevenue || 0).toFixed(2)} ETB ({paymentBreakdown.cardPercent || 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Cash on Delivery</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {Number(paymentBreakdown.codRevenue || 0).toFixed(2)} ETB ({paymentBreakdown.codPercent || 0}%)
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Driver COD Cash Settlement Reconciliation Table */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Driver COD Settlement Reconciliation
            </h3>
            <p className="text-xs text-slate-500">
              Cash collected from customers minus driver delivery fees earned = Net Deposit owed to company
            </p>
          </div>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg self-start sm:self-auto">
            {driverBalances.length} couriers with cash orders
          </span>
        </div>

        <DataTable
          density="compact"
          bordered={true}
          storageKey="admin-financial-cod"
          columns={[
            {
              key: 'driverName',
              title: 'Courier',
              sortable: true,
              minWidth: 160,
              render: (_, d) => (
                <DataTableTextCell value={d.driverName} copyable={true} />
              )
            },
            {
              key: 'phone',
              title: 'Contact',
              minWidth: 120,
              render: (_, d) => (
                <span className="text-xs text-slate-500 tabular-nums">{d.phone || 'N/A'}</span>
              )
            },
            {
              key: 'ordersCount',
              title: 'COD Orders',
              sortable: true,
              align: 'center',
              minWidth: 110,
              render: (_, d) => (
                <span className="text-xs font-medium tabular-nums">{d.ordersCount} trips</span>
              )
            },
            {
              key: 'codCollected',
              title: 'Cash Collected (ETB)',
              sortable: true,
              align: 'right',
              minWidth: 140,
              render: (_, d) => (
                <DataTableNumericCell
                  value={d.codCollected}
                  currency={true}
                  className="text-amber-600 dark:text-amber-400 font-bold"
                />
              )
            },
            {
              key: 'deliveryFeesEarned',
              title: 'Fees Earned (ETB)',
              sortable: true,
              align: 'right',
              minWidth: 130,
              render: (_, d) => (
                <DataTableNumericCell
                  value={d.deliveryFeesEarned}
                  currency={true}
                  className="text-emerald-600 dark:text-emerald-400 font-bold"
                />
              )
            },
            {
              key: 'netDepositOwed',
              title: 'Net Deposit Owed',
              sortable: true,
              align: 'right',
              minWidth: 140,
              render: (_, d) => (
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-mono font-bold tabular-nums text-xs ${
                      d.netDepositOwed > 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {formatCurrency(d.netDepositOwed)}
                  </span>
                </div>
              )
            }
          ]}
          data={driverBalances}
          rowKey="driverId"
          emptyTitle="No COD orders recorded"
          emptyMessage="No Cash on Delivery orders recorded for couriers in this reporting period."
          summaryRow={
            driverBalances.length > 0 ? (
              <tr>
                <td colSpan={2} className="py-2.5 px-3 text-left font-bold text-slate-900 dark:text-white">
                  Total Reconciliation ({driverBalances.length} Couriers)
                </td>
                <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                  {driverBalances.reduce((acc, d) => acc + (d.ordersCount || 0), 0)} trips
                </td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums font-mono text-amber-600 dark:text-amber-400">
                  {formatCurrency(driverBalances.reduce((acc, d) => acc + (d.codCollected || 0), 0))}
                </td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(driverBalances.reduce((acc, d) => acc + (d.deliveryFeesEarned || 0), 0))}
                </td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums font-mono text-slate-900 dark:text-white">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                    {formatCurrency(driverBalances.reduce((acc, d) => acc + (d.netDepositOwed || 0), 0))}
                  </span>
                </td>
              </tr>
            ) : null
          }
        />
      </motion.div>
    </div>
  );
};

export default FinancialReport;
