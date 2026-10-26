import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow, isValid } from 'date-fns';
import {
  FiShoppingBag,
  FiArrowRight,
  FiPackage,
  FiImage,
  FiTrendingUp,
  FiEye
} from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/adminHelpers';

const RecentOrdersAndTopSelling = ({
  normalizedTopSellingFoods = [],
  recentOrders = [],
  onViewAllOrders,
  onViewAllFoods
}) => {
  const navigate = useNavigate();

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) return 'Just now';
    const parsed = new Date(dateValue);
    if (!isValid(parsed)) return 'Recently';
    return formatDistanceToNow(parsed, { addSuffix: true });
  };

  const getRankBadgeClass = (index) => {
    switch (index) {
      case 0:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-black';
      case 1:
        return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold';
      case 2:
        return 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800 font-bold';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 1. Top Selling Items Menu Leaderboard */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-primary-600" />
                Best-Selling Dishes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Top food items by order volume and popularity
              </p>
            </div>
            <button
              type="button"
              onClick={onViewAllFoods}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Menu</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {normalizedTopSellingFoods.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-xs">No food sales data recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedTopSellingFoods.slice(0, 5).map((food, index) => {
                const ordersCount = food.orders ?? food.quantity ?? 0;
                const revenue = food.revenue ?? 0;

                return (
                  <motion.div
                    key={food._id || food.name || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-primary-400 transition-colors"
                  >
                    {/* Rank Badge, Image & Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Rank Position */}
                      <span
                        className={`w-6 h-6 rounded-lg text-2xs flex items-center justify-center border shrink-0 ${getRankBadgeClass(
                          index
                        )}`}
                      >
                        #{index + 1}
                      </span>

                      {/* Image Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FiImage className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {food.name}
                        </p>
                        <span className="text-2xs text-slate-400 dark:text-slate-500">
                          {food.category || 'Specialty'}
                        </span>
                      </div>
                    </div>

                    {/* Stats: Orders & Revenue */}
                    <div className="text-right shrink-0 pl-3">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums block">
                        {ordersCount.toLocaleString()} {ordersCount === 1 ? 'order' : 'orders'}
                      </span>
                      {revenue > 0 && (
                        <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums block">
                          {formatCurrency(revenue)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Recent Live Orders Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-primary-600" />
                Recent Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time incoming customer transactions
              </p>
            </div>
            <button
              type="button"
              onClick={onViewAllOrders}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Orders</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FiShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-xs">No orders recorded in this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order, index) => {
                const totalAmount = Number(order.totalAmount || 0);
                const itemsCount = order.items?.length || 0;
                const itemsPreview = Array.isArray(order.items)
                  ? order.items
                      .map((it) => `${it.quantity || 1}x ${it.food?.name || it.name || 'Item'}`)
                      .slice(0, 2)
                      .join(', ') + (order.items.length > 2 ? '...' : '')
                  : '';

                return (
                  <motion.div
                    key={order._id || index}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-primary-400 transition-all cursor-pointer group"
                    title="Click to view complete order receipt"
                  >
                    {/* Left: Order #, Customer, Time & Items Preview */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                        <FiShoppingBag className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            #{order.orderNumber}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">
                            {order.customer?.name || 'Customer'}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-400 truncate mt-0.5">
                          {itemsPreview ? `${itemsCount} items (${itemsPreview})` : formatRelativeTime(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount, Status & Quick View Link */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                      <div className="text-right">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums block">
                          {formatCurrency(totalAmount)}
                        </span>
                        <span className="text-2xs text-slate-400 block">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>

                      <StatusBadge
                        status={order.orderStatus}
                        type="order"
                        variant="pill"
                        size="sm"
                      />

                      <div className="p-1 rounded-lg text-slate-400 group-hover:text-primary-600 transition-colors">
                        <FiEye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersAndTopSelling;
