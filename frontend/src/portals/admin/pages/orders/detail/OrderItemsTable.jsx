import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/adminHelpers';

const OrderItemsTable = ({ order, itemVariants }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Order Items
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th scope="col" className="pb-3 text-left font-semibold">Item</th>
              <th scope="col" className="pb-3 text-center font-semibold">Qty</th>
              <th scope="col" className="pb-3 text-right font-semibold">Price</th>
              <th scope="col" className="pb-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-center font-medium text-slate-600 dark:text-slate-400 text-sm tabular-nums">
                  {item.quantity}
                </td>
                <td className="py-3.5 text-right text-slate-600 dark:text-slate-400 text-sm tabular-nums">
                  {formatCurrency(Number(item.price || 0))}
                </td>
                <td className="py-3.5 text-right font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                  {formatCurrency(item.quantity * Number(item.price || 0))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 dark:border-slate-700">
            <tr>
              <td colSpan={3} className="pt-4 text-right text-slate-600 dark:text-slate-400 text-sm">
                Subtotal
              </td>
              <td className="pt-4 text-right font-medium text-slate-900 dark:text-white text-sm tabular-nums">
                {formatCurrency(Number(order.subtotal || 0))}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="pt-2 text-right text-slate-600 dark:text-slate-400 text-sm">
                Delivery Fee
              </td>
              <td className="pt-2 text-right font-medium text-slate-900 dark:text-white text-sm tabular-nums">
                {formatCurrency(Number(order.deliveryFee || 0))}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="pt-2 text-right text-slate-600 dark:text-slate-400 text-sm">
                Tax
              </td>
              <td className="pt-2 text-right font-medium text-slate-900 dark:text-white text-sm tabular-nums">
                {formatCurrency(Number(order.tax || 0))}
              </td>
            </tr>
            <tr className="text-base sm:text-lg">
              <td colSpan={3} className="pt-4 text-right font-bold text-slate-900 dark:text-white">
                Total
              </td>
              <td className="pt-4 text-right font-bold text-primary-600 tabular-nums">
                {formatCurrency(Number(order.totalAmount || 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
};

export default OrderItemsTable;
