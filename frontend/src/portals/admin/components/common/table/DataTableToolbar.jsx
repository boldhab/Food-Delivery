import React from 'react';
import { FiSearch, FiX, FiDownload, FiRefreshCw, FiRotateCcw } from 'react-icons/fi';
import DataTableColumnVisibility from './DataTableColumnVisibility';

export const DataTableToolbar = ({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  columns = [],
  columnVisibility = {},
  onToggleColumn,
  onResetColumns,
  filters = {},
  onRemoveFilter,
  onResetAllFilters,
  onExport,
  onRefresh,
  loading = false,
  isRefetching = false,
  selectedCount = 0,
  toolbarActions,
  storageKey
}) => {
  const hasActiveSearch = Boolean(search && search.trim().length > 0);
  const activeFilterKeys = Object.keys(filters).filter((k) => {
    const val = filters[k];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && !Array.isArray(val)) {
      return Object.values(val).some((v) => v !== '' && v !== null && v !== undefined);
    }
    return true;
  });

  const hasAnyFiltersOrSearch = hasActiveSearch || activeFilterKeys.length > 0;

  return (
    <div className="p-3.5 border-b border-border space-y-2.5">
      {/* Top Toolbar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Search & Selected count */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {onSearchChange && (
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-9 pl-9 pr-8 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
              />
              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {selectedCount > 0 && (
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline">
              <strong className="text-foreground tabular-nums font-semibold">{selectedCount}</strong> selected
            </span>
          )}
        </div>

        {/* Right Side: Column Visibility, Custom Actions, Export, Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {toolbarActions}

          {/* Column Visibility Menu */}
          {columns.length > 0 && (
            <DataTableColumnVisibility
              columns={columns}
              columnVisibility={columnVisibility}
              onToggleColumn={onToggleColumn}
              onResetColumns={onResetColumns}
            />
          )}

          {/* Export Action */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              aria-label="Export table data"
              title="Export table data"
              className="h-9 w-9 flex items-center justify-center text-foreground hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 bg-card rounded-xl border border-border transition-colors shadow-2xs cursor-pointer"
            >
              <FiDownload className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading || isRefetching}
              aria-label="Refresh table data"
              title="Refresh table data"
              className="h-9 w-9 flex items-center justify-center text-foreground hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 bg-card rounded-xl border border-border transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading || isRefetching ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips / Reset Bar */}
      {hasAnyFiltersOrSearch && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-2xs">
          <span className="text-slate-400 font-medium">Active filters:</span>

          {hasActiveSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Search: &ldquo;{search}&rdquo;</span>
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                aria-label="Remove search filter"
                className="hover:text-rose-500"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilterKeys.map((key) => {
            const col = columns.find((c) => c.key === key);
            const val = filters[key];
            let displayVal = String(val);
            if (Array.isArray(val)) {
              displayVal = val.join(', ');
            } else if (typeof val === 'object' && val !== null) {
              if (val.min !== undefined || val.max !== undefined) {
                displayVal = `${val.min || '0'} - ${val.max || 'max'}`;
              } else if (val.start || val.end) {
                displayVal = `${val.start || 'start'} to ${val.end || 'end'}`;
              }
            } else if (typeof val === 'boolean') {
              displayVal = val ? 'Yes' : 'No';
            }

            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 font-medium"
              >
                <span>
                  {col?.title || key}: {displayVal}
                </span>
                {onRemoveFilter && (
                  <button
                    type="button"
                    onClick={() => onRemoveFilter(key)}
                    aria-label={`Remove filter for ${col?.title || key}`}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}

          {onResetAllFilters && (
            <button
              type="button"
              onClick={onResetAllFilters}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold ml-1 cursor-pointer transition-colors"
            >
              <FiRotateCcw className="w-2.5 h-2.5" />
              <span>Reset all</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTableToolbar;
