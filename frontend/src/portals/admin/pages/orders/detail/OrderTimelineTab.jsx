import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const OrderTimelineTab = ({ order, itemVariants }) => {
  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
    >
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Order Status Timeline
      </h2>

      <div className="space-y-6">
        {order.statusHistory?.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-primary-600' : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {index === 0 ? (
                  <FiCheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <FiClock className="w-5 h-5 text-slate-500" />
                )}
              </div>
              {index < order.statusHistory.length - 1 && (
                <div className="absolute top-10 left-1/2 w-0.5 h-12 bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white capitalize text-sm">
                  Status changed to {event.status?.replace(/_/g, ' ')}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {event.timestamp ? format(new Date(event.timestamp), 'MMM d, h:mm a') : 'Recent'}
                </span>
              </div>
              {event.note && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Note: {event.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderTimelineTab;
