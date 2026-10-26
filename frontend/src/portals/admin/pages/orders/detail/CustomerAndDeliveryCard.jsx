import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const CustomerAndDeliveryCard = ({ order, itemVariants }) => {
  return (
    <>
      {/* Customer Information */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiUser className="text-primary-600" />
          Customer Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 text-xl font-bold">
              {order.customer?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {order.customer?.name || order.customerName || 'Anonymous Customer'}
              </p>
              <p className="text-xs text-slate-500">
                Customer ID: {(order.customer?.id || order.userId)?.slice(-6)}
              </p>
            </div>
          </div>
          <div className="pt-3 space-y-2">
            <p className="flex items-center gap-2 text-sm">
              <FiMail className="w-4 h-4 text-slate-400" />
              <a
                href={`mailto:${order.customer?.email || order.customerEmail}`}
                className="text-slate-600 dark:text-slate-400 hover:text-primary-600"
              >
                {order.customer?.email || order.customerEmail}
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <FiPhone className="w-4 h-4 text-slate-400" />
              <a
                href={`tel:${order.customer?.phone || order.customerPhone}`}
                className="text-slate-600 dark:text-slate-400 hover:text-primary-600"
              >
                {order.customer?.phone || order.customerPhone}
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Delivery Address */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiMapPin className="text-primary-600" />
          Delivery Address
        </h3>
        <div className="space-y-3">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {order.deliveryAddress?.street || order.deliveryStreet}<br />
            {order.deliveryAddress?.city || order.deliveryCity},{' '}
            {order.deliveryAddress?.state || order.deliveryState}{' '}
            {order.deliveryAddress?.zipCode || order.deliveryZipCode}
          </p>
          {(order.deliveryAddress?.instructions || order.deliveryInstructions) && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Delivery Instructions:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                {order.deliveryAddress?.instructions || order.deliveryInstructions}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default CustomerAndDeliveryCard;
