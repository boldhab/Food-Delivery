import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';

const OrderCommunicationTab = ({
  message,
  setMessage,
  handleSendMessage
}) => {
  return (
    <motion.div
      key="communication"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Customer Messaging & Notifications
        </h2>

        {/* Message Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && message.trim() && handleSendMessage()}
            placeholder="Type a message or notification to send to customer..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            Send Notification
          </button>
        </div>

        {/* Quick Message Templates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() =>
              setMessage('Your order is being freshly prepared and will be packed shortly!')
            }
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors text-left group"
          >
            <FiClock className="w-5 h-5 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Kitchen Preparing</p>
            <p className="text-xs text-slate-500 mt-0.5">Quick order prep update</p>
          </button>

          <button
            onClick={() =>
              setMessage('Your order is out for delivery! The driver is on the way to your address.')
            }
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors text-left group"
          >
            <FiTruck className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Out for Delivery</p>
            <p className="text-xs text-slate-500 mt-0.5">Transit milestone alert</p>
          </button>

          <button
            onClick={() =>
              setMessage('Your order has arrived! Enjoy your meal and thank you for ordering.')
            }
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors text-left group"
          >
            <FiCheckCircle className="w-5 h-5 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Order Arrived</p>
            <p className="text-xs text-slate-500 mt-0.5">Delivered completion notice</p>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCommunicationTab;
