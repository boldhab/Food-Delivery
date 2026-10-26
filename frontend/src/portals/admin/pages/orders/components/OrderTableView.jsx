import React from 'react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import {
  FiEye,
  FiPrinter,
  FiMail,
  FiMessageSquare,
  FiPackage,
  FiMapPin,
  FiTruck,
  FiInbox
} from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/adminHelpers';
import { DataTablePagination } from '../../../components/common/table/DataTablePagination';

const OrderTableView = ({
  orders = [],
  isLoading = false,
  totalItems = 0,
  selectedOrders = [],
  areAllVisibleSelected = false,
  toggleSelectAllVisible,
  toggleOrderSelection,
  onViewOrder,
  onPrintOrder,
  onSendEmail,
  onSendSMS,
  pagination,
  goToPage,
  setPageSize
}) => {
  const someSelected = selectedOrders.length > 0;

  const formatDateDisplay = (dateValue) => {
    if (!dateValue) return { full: 'N/A', relative: '' };
    const date = new Date(dateValue);
    if (!isValid(date)) return { full: 'Invalid Date', relative: '' };
    return {
      full: format(date, 'MMM d, yyyy • h:mm a'),
      relative: formatDistanceToNow(date, { addSuffix: true })
    };
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* List Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-3">
          {toggleSelectAllVisible && (
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium select-none hover:text-slate-900 dark:hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={areAllVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span>Select all on this page</span>
            </label>
          )}

          {someSelected && (
            <span className="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold px-2 py-0.5 rounded-full text-2xs">
              {selectedOrders.length} selected
            </span>
          )}

          <span className="text-slate-400">•</span>
          <span className="text-slate-500 tabular-nums">
            {totalItems || orders.length} orders
          </span>
        </div>
      </div>

      {/* Main Content: Skeleton, Empty, or Order Rows */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-36 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FiInbox className="w-6 h-6" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
            No orders found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your status tabs, date range, or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isSelected = selectedOrders.includes(order._id);
            const dateInfo = formatDateDisplay(order.createdAt);
            const totalAmount = Number(order.totalAmount || 0);
            const itemCount = order.items?.length || 0;
            const itemsSummary = Array.isArray(order.items)
              ? order.items
                  .map((it) => `${it.quantity || 1}x ${it.food?.name || it.name || 'Item'}`)
                  .join(', ')
              : '';
            const deliveryAddress =
              order.deliveryAddress?.address ||
              order.address ||
              order.deliveryAddress?.street ||
              '';

            return (
              <div
                key={order._id}
                onClick={() => onViewOrder?.(order._id)}
                className={`group flex flex-col p-3.5 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 shadow-xs'
                    : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs'
                }`}
              >
                {/* Primary Row: Order #, Time, Customer, Statuses, Total, Driver & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Checkbox + Order # + Customer */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {toggleOrderSelection && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Order Number Badge */}
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                      #{order.orderNumber}
                    </span>

                    {/* Customer Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {order.customer?.name || 'Walk-in Customer'}
                        </span>
                        {order.customer?.phone && (
                          <span className="text-2xs text-slate-400 dark:text-slate-500">
                            ({order.customer.phone})
                          </span>
                        )}
                      </div>
                      <span
                        className="text-2xs text-slate-500 dark:text-slate-400 block"
                        title={dateInfo.full}
                      >
                        {dateInfo.relative || dateInfo.full}
                      </span>
                    </div>
                  </div>

                  {/* Middle / Right: Badges, Total Amount, Driver & Action Buttons */}
                  <div
                    className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 flex-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={order.orderStatus}
                        type="order"
                        variant="pill"
                        showIcon
                      />
                      <StatusBadge
                        status={order.paymentStatus}
                        type="payment"
                        variant="dot"
                      />
                    </div>

                    {/* Total Amount */}
                    <div className="text-right min-w-[80px]">
                      <span className="font-bold text-slate-900 dark:text-white text-base tabular-nums block">
                        {formatCurrency(totalAmount)}
                      </span>
                      <span className="text-2xs text-slate-400 uppercase tracking-wider block">
                        {(order.paymentMethod || 'Card').replace('_', ' ')}
                      </span>
                    </div>

                    {/* Driver Tag */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 min-w-[110px] justify-end">
                      <FiTruck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[90px]">
                        {order.driver?.name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {onViewOrder && (
                        <button
                          type="button"
                          onClick={() => onViewOrder(order._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View order details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      )}
                      {onPrintOrder && (
                        <button
                          type="button"
                          onClick={() => onPrintOrder(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Print invoice"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                      )}
                      {onSendEmail && (
                        <button
                          type="button"
                          onClick={() => onSendEmail(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Send email receipt"
                        >
                          <FiMail className="w-4 h-4" />
                        </button>
                      )}
                      {onSendSMS && (
                        <button
                          type="button"
                          onClick={() => onSendSMS(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Send SMS update"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary Row: Ordered Items Preview & Delivery Destination */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FiPackage className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}:
                    </span>
                    <span className="truncate text-slate-600 dark:text-slate-400 font-normal">
                      {itemsSummary || 'No item details listed'}
                    </span>
                  </div>

                  {deliveryAddress && (
                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <FiMapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{deliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <DataTablePagination
            currentPage={pagination?.currentPage || 1}
            pageSize={pagination?.itemsPerPage || 10}
            totalItems={totalItems || pagination?.totalItems || 0}
            onPageChange={(page) => goToPage?.(page)}
            onPageSizeChange={(sz) => setPageSize?.(sz)}
            selectedCount={selectedOrders.length}
          />
        </div>
      )}
    </div>
  );
};

export default OrderTableView;
