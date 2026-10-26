import React from 'react';
import { FiInbox, FiSearch, FiAlertTriangle, FiRefreshCw, FiPlus, FiX } from 'react-icons/fi';

export const DataTableEmptyState = ({
  type = 'empty', // 'empty' | 'no-results' | 'error' | 'loading'
  title,
  message,
  error,
  onRetry,
  onClearFilters,
  emptyAction,
  className = ''
}) => {
  if (type === 'error' || error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred while fetching table data.';
    return (
      <div className={`py-12 px-4 text-center flex flex-col items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mb-3">
          <FiAlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          {title || 'Failed to Load Data'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {errorMessage}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Retry Request</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className={`py-12 px-4 text-center flex flex-col items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <FiSearch className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          {title || 'No Matching Records'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {message || 'No records match your active search query or filters. Try adjusting your parameters or resetting filters.'}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
          >
            <FiX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    );
  }

  // Pure Empty dataset
  return (
    <div className={`py-14 px-4 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
        <FiInbox className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title || message || 'No records available'}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {message && title ? message : 'There are currently no items in this view. When items are created, they will appear here.'}
      </p>
      {emptyAction && (
        <div>
          {React.isValidElement(emptyAction) ? (
            emptyAction
          ) : typeof emptyAction === 'object' && emptyAction.onClick ? (
            <button
              type="button"
              onClick={emptyAction.onClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              {emptyAction.icon || <FiPlus className="w-4 h-4" />}
              <span>{emptyAction.label || 'Add Item'}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DataTableEmptyState;
