import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTruck, FiPhone } from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';

const PaymentAndDriverCard = ({
  order,
  setShowDriverModal,
  itemVariants
}) => {
  return (
    <>
      {/* Payment Information */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="text-primary-600" />
          Payment Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Method</span>
            <span className="font-semibold text-slate-900 dark:text-white uppercase text-sm">
              {order.paymentMethod?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Payment Status</span>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
          {order.paymentId && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Payment Reference</span>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {order.paymentId.slice(-8)}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Driver Information */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FiTruck className="text-primary-600" />
            Assigned Driver
          </h3>
          {order.driver && (
            <button
              onClick={() => setShowDriverModal(true)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Reassign
            </button>
          )}
        </div>

        {order.driver ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                {order.driver.name?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {order.driver.name}
                </p>
                <p className="text-xs text-slate-500">
                  {order.driver.driverProfile?.vehicleType || 'Vehicle'} •{' '}
                  {order.driver.driverProfile?.plateNumber || 'No Plate'}
                </p>
              </div>
            </div>
            {order.driver.phone && (
              <p className="flex items-center gap-2 text-sm pt-1">
                <FiPhone className="w-4 h-4 text-slate-400" />
                <a
                  href={`tel:${order.driver.phone}`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 font-medium"
                >
                  {order.driver.phone}
                </a>
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-3">No delivery driver assigned yet</p>
            <button
              onClick={() => setShowDriverModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold shadow-md shadow-orange-500/20"
            >
              Assign Driver Now
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default PaymentAndDriverCard;
