import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiTruck,
  FiDollarSign,
  FiShoppingBag,
  FiStar,
  FiCheckCircle,
  FiAlertCircle
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

// ── Inline status filter component ─────────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Online', 'Offline'];

const DriverStatusFilter = ({ drivers, onFiltered }) => {
  const [active, setActive] = useState('All');

  const handleSelect = (option) => {
    setActive(option);
    if (option === 'All') {
      onFiltered(drivers);
    } else {
      onFiltered(drivers.filter((d) => (option === 'Online' ? d.isAvailable : !d.isAvailable)));
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => handleSelect(opt)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
            active === opt
              ? opt === 'Online'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : opt === 'Offline'
                ? 'bg-slate-500 border-slate-500 text-white'
                : 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
              : 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────
const DriverReport = ({ reportData, itemVariants, cardVariants }) => {
  const fleetSummary = reportData.fleetSummary || {};
  const drivers = reportData.driverPerformance || [];

  const totalDeliveries = fleetSummary.totalDeliveries ?? drivers.reduce((sum, d) => sum + (d.deliveries || 0), 0);
  const totalEarnings = fleetSummary.totalEarnings ?? drivers.reduce((sum, d) => sum + (d.earnings || 0), 0);
  const totalCod = fleetSummary.totalCodCollected ?? drivers.reduce((sum, d) => sum + (d.codCollected || 0), 0);
  const activeDrivers = fleetSummary.activeDrivers ?? drivers.filter((d) => d.isAvailable).length;

  // ── Status filter state ──────────────────────────────────────────────────────
  const [filteredDrivers, setFilteredDrivers] = useState(drivers);

  // Keep filteredDrivers in sync when reportData changes (e.g. date range switch)
  React.useEffect(() => { setFilteredDrivers(drivers); }, [drivers]);

  // ── Column definitions ───────────────────────────────────────────────────────
  const driverColumns = [
    {
      key: 'driver',
      title: 'Driver Name',
      sortable: true,
      render: (val) => <DataTableTextCell value={val} />,
    },
    {
      key: 'isAvailable',
      title: 'Status',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
            val
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}
        >
          {val ? 'Online' : 'Offline'}
        </span>
      ),
    },
    {
      key: 'vehicleType',
      title: 'Vehicle',
      render: (val) => <DataTableTextCell value={val} />,
    },
    {
      key: 'deliveries',
      title: 'Trips',
      sortable: true,
      align: 'center',
      render: (val) => <DataTableNumericCell value={val} />,
    },
    {
      key: 'earnings',
      title: 'Earnings (ETB)',
      sortable: true,
      align: 'right',
      render: (val) => <DataTableNumericCell value={val} currency />,
    },
    {
      key: 'codCollected',
      title: 'COD Held (ETB)',
      sortable: true,
      align: 'right',
      render: (val) => <DataTableNumericCell value={val} currency />,
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          ⭐ {Number(val || 0).toFixed(1)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Fleet Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deliveries in Period</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalDeliveries}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Completed drop-offs</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Courier Payouts</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ${Number(totalEarnings).toFixed(2)}
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Earned delivery fees</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">COD Cash in Hand</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                ${Number(totalCod).toFixed(2)}
              </p>
            </div>
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Unremitted customer cash</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Available Couriers</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {activeDrivers} / {drivers.length}
              </p>
            </div>
            <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700/60 rounded-xl flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Online ready for orders</p>
        </motion.div>
      </div>

      {/* Driver Performance Table & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Performance Roster */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Courier Performance Roster
            </h3>
            <span className="text-xs text-slate-500">{drivers.length} drivers tracked</span>
          </div>

          {/* Status Filter Pills */}
          <DriverStatusFilter drivers={drivers} onFiltered={setFilteredDrivers} />

          {/* DataTable */}
          <DataTable
            storageKey="admin-drivers-report-table"
            density="compact"
            data={filteredDrivers}
            rowKey={(row) => row.driverId || row.driver}
            hidePagination={false}
            emptyMessage="No drivers match the selected filter"
            columns={driverColumns}
            summaryRow={
              <tr>
                <td className="py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200">Totals</td>
                <td className="py-2 px-3" />
                <td className="py-2 px-3" />
                <td className="py-2 px-3 text-xs font-bold text-center text-slate-700 dark:text-slate-200">
                  {filteredDrivers.reduce((s, d) => s + (d.deliveries || 0), 0)}
                </td>
                <td className="py-2 px-3 text-xs font-bold text-right text-emerald-600">
                  ${filteredDrivers.reduce((s, d) => s + (d.earnings || 0), 0).toFixed(2)}
                </td>
                <td className="py-2 px-3 text-xs font-bold text-right text-amber-600">
                  ${filteredDrivers.reduce((s, d) => s + (d.codCollected || 0), 0).toFixed(2)}
                </td>
                <td className="py-2 px-3" />
              </tr>
            }
          />
        </motion.div>

        {/* Courier Earnings & Trips Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Driver Earnings & Trips
            </h3>
            <span className="text-xs text-slate-500">Delivery fees (ETB)</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drivers} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="driver"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'earnings' ? `${Number(val).toFixed(2)} ETB` : val,
                    name === 'earnings' ? 'Earnings' : 'Deliveries'
                  ]}
                />
                <Legend />
                <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} name="Earnings (ETB)" />
                <Bar dataKey="deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverReport;
