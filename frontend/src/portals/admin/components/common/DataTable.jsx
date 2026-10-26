import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowUp,
  FiArrowDown,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';
import './DataTable.css';

import { useTablePreferences } from './table/useTablePreferences';
import { DataTableToolbar } from './table/DataTableToolbar';
import { DataTablePagination } from './table/DataTablePagination';
import { DataTableColumnVisibility } from './table/DataTableColumnVisibility';
import { DataTableFilterMenu } from './table/DataTableFilterMenu';
import { DataTableEmptyState } from './table/DataTableEmptyState';
import {
  DataTableTextCell,
  DataTableDateCell,
  DataTableBooleanCell,
  DataTableNumericCell,
  DataTableActionMenu
} from './table/DataTableCells';

/**
 * Enterprise Data Table
 * High-performance, accessible, responsive table system for administrative,
 * operational, and dense financial grids.
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  isRefetching = false,
  error = null,
  onRetry,
  onSort,
  sortConfig: controlledSortConfig,
  onFilter,
  filters: controlledFilters,
  search: controlledSearch,
  onSearch,
  searchPlaceholder = 'Search records...',
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  totalItems = 0,
  rowKey = '_id',
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  onSelectAll: customSelectAll,
  onRowClick,
  expandable = false,
  expandedRowRender,
  expandedRows: controlledExpandedRows,
  onExpandRow,
  emptyTitle,
  emptyMessage = 'No records available',
  emptyAction,
  toolbarActions,
  onExport,
  onRefresh,
  storageKey,
  size = 'normal', // 'compact' | 'normal' | 'spacious' (or 'small' | 'medium' | 'large')
  density, // alternative prop name for size
  stickyHeader = false,
  bordered = true,
  striped = false,
  hoverable = true,
  className = '',
  height = 'auto',
  summaryRow = null,
  caption,
  hideToolbar = false,
  hidePagination = false
}) => {
  // Density calculation
  const activeDensity = density || size || 'normal';
  const densityStyles = {
    compact: {
      th: 'py-2 px-3 text-2xs uppercase tracking-wider',
      td: 'py-2 px-3 text-xs',
      tfoot: 'py-2 px-3 text-xs'
    },
    small: {
      th: 'py-2 px-3 text-2xs uppercase tracking-wider',
      td: 'py-2 px-3 text-xs',
      tfoot: 'py-2 px-3 text-xs'
    },
    normal: {
      th: 'py-3.5 px-4 text-2xs uppercase tracking-wider',
      td: 'py-3.5 px-4 text-sm',
      tfoot: 'py-3 px-4 text-sm'
    },
    medium: {
      th: 'py-3.5 px-4 text-2xs uppercase tracking-wider',
      td: 'py-3.5 px-4 text-sm',
      tfoot: 'py-3 px-4 text-sm'
    },
    spacious: {
      th: 'py-4 px-5 text-xs uppercase tracking-wider',
      td: 'py-4 px-5 text-base',
      tfoot: 'py-3.5 px-5 text-base'
    },
    large: {
      th: 'py-4 px-5 text-xs uppercase tracking-wider',
      td: 'py-4 px-5 text-base',
      tfoot: 'py-3.5 px-5 text-base'
    }
  };
  const currentDensity = densityStyles[activeDensity] || densityStyles.normal;

  // Column preferences & visibility hook (with versioned localStorage persistence)
  const {
    columnVisibility,
    visibleColumns,
    toggleColumnVisibility,
    resetColumnVisibility
  } = useTablePreferences(storageKey, columns);

  // Sorting state (controlled or uncontrolled)
  const [internalSort, setInternalSort] = useState({ key: null, direction: 'asc' });
  const activeSort = controlledSortConfig !== undefined ? controlledSortConfig : internalSort;

  // Filtering state (controlled or uncontrolled)
  const [internalFilters, setInternalFilters] = useState({});
  const activeFilters = controlledFilters !== undefined ? controlledFilters : internalFilters;

  // Search state (controlled or uncontrolled)
  const [internalSearch, setInternalSearch] = useState('');
  const activeSearch = controlledSearch !== undefined ? controlledSearch : internalSearch;

  // Selection state (controlled or uncontrolled)
  const [internalSelected, setInternalSelected] = useState([]);
  const activeSelected = controlledSelectedRows !== undefined ? controlledSelectedRows : internalSelected;

  // Expansion state
  const [internalExpanded, setInternalExpanded] = useState([]);
  const activeExpanded = controlledExpandedRows !== undefined ? controlledExpandedRows : internalExpanded;

  // Hover state
  const [hoveredRow, setHoveredRow] = useState(null);

  // Indeterminate select-all checkbox ref
  const selectAllRef = useRef(null);
  const tableRef = useRef(null);

  // Row Key Resolver
  const getRowKey = useCallback(
    (record, index) => {
      if (typeof rowKey === 'function') return rowKey(record, index);
      if (record && rowKey && record[rowKey] !== undefined) return record[rowKey];
      if (record && record._id !== undefined) return record._id;
      if (record && record.id !== undefined) return record.id;
      return index;
    },
    [rowKey]
  );

  // Sorting Handler
  const handleSort = (key) => {
    let newDirection = 'asc';
    if (activeSort && activeSort.key === key) {
      newDirection = activeSort.direction === 'asc' ? 'desc' : 'asc';
    }

    if (onSort) {
      onSort(key, newDirection);
    } else {
      setInternalSort({ key, direction: newDirection });
    }
  };

  // Filter Handler
  const handleApplyFilter = (key, val) => {
    const updated = { ...activeFilters, [key]: val };
    if (onFilter) onFilter(updated);
    else setInternalFilters(updated);
  };

  const handleClearFilter = (key) => {
    const updated = { ...activeFilters };
    delete updated[key];
    if (onFilter) onFilter(updated);
    else setInternalFilters(updated);
  };

  const handleResetAllFilters = () => {
    if (onFilter) onFilter({});
    else setInternalFilters({});
    if (onSearch) onSearch('');
    else setInternalSearch('');
  };

  // Search Handler
  const handleSearchChange = (term) => {
    if (onSearch) onSearch(term);
    else setInternalSearch(term);
  };

  // Selection Handlers
  const handleSelectRow = (key, e) => {
    e?.stopPropagation();
    let next;
    if (activeSelected.includes(key)) {
      next = activeSelected.filter((id) => id !== key);
    } else {
      next = [...activeSelected, key];
    }

    if (onSelectionChange) onSelectionChange(next);
    else setInternalSelected(next);
  };

  const handleSelectAll = (e) => {
    e?.stopPropagation();
    if (customSelectAll) {
      customSelectAll();
      return;
    }

    const currentKeys = data.map(getRowKey);
    const areAllSelected = currentKeys.length > 0 && currentKeys.every((k) => activeSelected.includes(k));

    let next;
    if (areAllSelected) {
      next = activeSelected.filter((id) => !currentKeys.includes(id));
    } else {
      const set = new Set(activeSelected);
      currentKeys.forEach((k) => set.add(k));
      next = Array.from(set);
    }

    if (onSelectionChange) onSelectionChange(next);
    else setInternalSelected(next);
  };

  // Expansion Handlers
  const handleToggleExpand = (key, e) => {
    e?.stopPropagation();
    let next;
    if (activeExpanded.includes(key)) {
      next = activeExpanded.filter((id) => id !== key);
    } else {
      next = [...activeExpanded, key];
    }

    if (onExpandRow) onExpandRow(key, next);
    else setInternalExpanded(next);
  };

  // Safe Row Click Handler
  const handleRowClick = (record, event) => {
    if (!onRowClick) return;
    // Ignore clicks originating from interactive elements
    if (
      event.target.closest(
        'button, a, input, select, textarea, [role="button"], [role="menuitem"], [role="checkbox"], [role="dialog"], [data-interactive="true"]'
      )
    ) {
      return;
    }
    onRowClick(record, event);
  };

  // Process data if client-side search/sort is needed and no external handlers were passed
  const processedData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Client-side search (if onSearch is not provided and activeSearch is present)
    if (!onSearch && activeSearch && activeSearch.trim()) {
      const q = activeSearch.toLowerCase().trim();
      result = result.filter((item) =>
        Object.values(item).some((v) =>
          typeof v === 'string' || typeof v === 'number'
            ? String(v).toLowerCase().includes(q)
            : false
        )
      );
    }

    // Client-side sort (if onSort is not provided and activeSort.key is present)
    if (!onSort && activeSort && activeSort.key) {
      result.sort((a, b) => {
        const valA = a[activeSort.key];
        const valB = b[activeSort.key];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        let comp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comp = valA - valB;
        } else {
          comp = String(valA).localeCompare(String(valB));
        }
        return activeSort.direction === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, onSearch, activeSearch, onSort, activeSort]);

  // Sync indeterminate state of select all checkbox
  const visibleRowKeys = useMemo(() => processedData.map(getRowKey), [processedData, getRowKey]);
  const isAllSelected = visibleRowKeys.length > 0 && visibleRowKeys.every((k) => activeSelected.includes(k));
  const isPartiallySelected =
    !isAllSelected && visibleRowKeys.some((k) => activeSelected.includes(k));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  // Calculate total columns spanning count
  const totalColSpan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (expandable ? 1 : 0);

  // Determine if active filters/search exist
  const hasActiveFiltersOrSearch = Boolean(
    (activeSearch && activeSearch.trim()) ||
    Object.keys(activeFilters).some((k) => {
      const val = activeFilters[k];
      return val !== '' && val !== null && val !== undefined && (!Array.isArray(val) || val.length > 0);
    })
  );

  return (
    <div
      className={`data-table-container bg-white dark:bg-slate-900 rounded-2xl ${
        bordered ? 'border border-slate-200 dark:border-slate-800 shadow-sm' : ''
      } flex flex-col ${className}`}
    >
      {/* 2px Indeterminate Progress Bar for Background Refetching */}
      {(isRefetching || (loading && processedData.length > 0)) && (
        <div
          role="progressbar"
          aria-label="Updating table data"
          aria-busy="true"
          className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-30 bg-primary-100 dark:bg-primary-950/40 pointer-events-none"
        >
          <div className="h-full bg-primary-600 animate-table-indeterminate origin-left" />
        </div>
      )}

      {/* Dynamic Filter Toolbar */}
      {!hideToolbar && (
        <DataTableToolbar
          search={activeSearch}
          onSearchChange={onSearch || !data ? handleSearchChange : handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          columns={columns}
          columnVisibility={columnVisibility}
          onToggleColumn={toggleColumnVisibility}
          onResetColumns={resetColumnVisibility}
          filters={activeFilters}
          onRemoveFilter={handleClearFilter}
          onResetAllFilters={handleResetAllFilters}
          onExport={onExport}
          onRefresh={onRefresh}
          loading={loading}
          isRefetching={isRefetching}
          selectedCount={activeSelected.length}
          toolbarActions={toolbarActions}
          storageKey={storageKey}
        />
      )}

      {/* Main Table Scroll Container */}
      <div
        ref={tableRef}
        role="region"
        aria-label="Data Table scroll region"
        tabIndex={0}
        className="data-table-scroll-container overflow-x-auto min-h-[220px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500/50"
        style={{ maxHeight: height !== 'auto' ? height : undefined }}
      >
        <table className="w-full text-left border-collapse border-spacing-0">
          {caption && <caption className="sr-only">{caption}</caption>}

          {/* Table Header */}
          <thead
            className={`border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 ${
              stickyHeader ? 'sticky top-0 z-20 backdrop-blur-xs' : ''
            }`}
          >
            <tr>
              {/* Selection Checkbox Column */}
              {selectable && (
                <th
                  scope="col"
                  className={`${currentDensity.th} w-10 text-center border-r border-slate-200/60 dark:border-slate-800/60`}
                >
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer transition-colors"
                  />
                </th>
              )}

              {/* Expand Toggle Column */}
              {expandable && (
                <th
                  scope="col"
                  className={`${currentDensity.th} w-10 text-center border-r border-slate-200/60 dark:border-slate-800/60`}
                  aria-label="Expand row column"
                />
              )}

              {/* Configured Data Columns */}
              {visibleColumns.map((col) => {
                const isSorted = activeSort?.key === col.key;
                const sortDir = isSorted ? activeSort.direction : null;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : col.sortable
                        ? 'none'
                        : undefined
                    }
                    className={`
                      ${currentDensity.th}
                      ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                      ${col.fixed === 'left' ? 'sticky left-0 bg-slate-50/95 dark:bg-slate-800/95 z-10' : ''}
                      ${col.fixed === 'right' ? 'sticky right-0 bg-slate-50/95 dark:bg-slate-800/95 z-10' : ''}
                      font-semibold text-slate-600 dark:text-slate-300 select-none
                      border-r last:border-r-0 border-slate-200/60 dark:border-slate-800/60
                      ${col.headerClassName || ''}
                    `}
                    style={{
                      width: col.width,
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth
                    }}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      } w-full`}
                    >
                      {/* Sortable Header Button or Plain Text */}
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          aria-label={`Sort by ${col.title}`}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                        >
                          <span>{col.title}</span>
                          <span className="flex items-center">
                            {sortDir === 'asc' ? (
                              <FiArrowUp className="w-3.5 h-3.5 text-primary-600 font-bold" />
                            ) : sortDir === 'desc' ? (
                              <FiArrowDown className="w-3.5 h-3.5 text-primary-600 font-bold" />
                            ) : (
                              <FiArrowUp className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <span>{col.title}</span>
                      )}

                      {/* Column-level Filter Popover */}
                      {col.filterable && (
                        <DataTableFilterMenu
                          column={col}
                          currentValue={activeFilters[col.key]}
                          onApplyFilter={handleApplyFilter}
                          onClearFilter={handleClearFilter}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Initial Loading Skeletons */}
            {loading && processedData.length === 0 ? (
              [...Array(pageSize > 15 ? 8 : Math.max(5, pageSize))].map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="border-b border-slate-100 dark:border-slate-800/60">
                  {selectable && (
                    <td className={`${currentDensity.td} text-center`}>
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mx-auto" />
                    </td>
                  )}
                  {expandable && (
                    <td className={`${currentDensity.td} text-center`}>
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mx-auto" />
                    </td>
                  )}
                  {visibleColumns.map((col, cIdx) => (
                    <td key={col.key || cIdx} className={currentDensity.td}>
                      <div
                        className={`h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse ${
                          cIdx % 2 === 0 ? 'w-3/4' : 'w-1/2'
                        } ${col.align === 'right' ? 'ml-auto' : col.align === 'center' ? 'mx-auto' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              /* Fetch Error State */
              <tr>
                <td colSpan={totalColSpan}>
                  <DataTableEmptyState
                    type="error"
                    error={error}
                    onRetry={onRetry || onRefresh}
                  />
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              /* Smart Empty States */
              <tr>
                <td colSpan={totalColSpan}>
                  <DataTableEmptyState
                    type={hasActiveFiltersOrSearch ? 'no-results' : 'empty'}
                    title={hasActiveFiltersOrSearch ? 'No matching records' : emptyTitle}
                    message={emptyMessage}
                    emptyAction={emptyAction}
                    onClearFilters={handleResetAllFilters}
                  />
                </td>
              </tr>
            ) : (
              /* Data Rows */
              processedData.map((record, rowIndex) => {
                const key = getRowKey(record, rowIndex);
                const isSelected = activeSelected.includes(key);
                const isExpanded = activeExpanded.includes(key);
                const isHovered = hoveredRow === key;

                return (
                  <React.Fragment key={key}>
                    <motion.tr
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(rowIndex * 0.015, 0.2) }}
                      tabIndex={onRowClick ? 0 : undefined}
                      role="row"
                      aria-selected={selectable ? isSelected : undefined}
                      onClick={(e) => handleRowClick(record, e)}
                      onKeyDown={(e) => {
                        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onRowClick(record, e);
                        }
                      }}
                      onMouseEnter={() => setHoveredRow(key)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`
                        transition-colors duration-150 select-text
                        ${striped && rowIndex % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'}
                        ${hoverable && !isSelected ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''}
                        ${isSelected ? 'bg-primary-50/60 dark:bg-primary-950/30' : ''}
                        ${onRowClick ? 'cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 focus:outline-none' : ''}
                      `}
                    >
                      {/* Selection Column */}
                      {selectable && (
                        <td
                          className={`${currentDensity.td} text-center border-r border-slate-100 dark:border-slate-800/60`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(key, e)}
                            aria-label={`Select row ${rowIndex + 1}`}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Expand Column */}
                      {expandable && (
                        <td
                          className={`${currentDensity.td} text-center border-r border-slate-100 dark:border-slate-800/60`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleToggleExpand(key, e)}
                            aria-label={isExpanded ? 'Collapse row details' : 'Expand row details'}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                          >
                            {isExpanded ? (
                              <FiChevronDown className="w-4 h-4" />
                            ) : (
                              <FiChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Data Columns */}
                      {visibleColumns.map((col) => {
                        const cellVal = record[col.key];

                        return (
                          <td
                            key={col.key}
                            className={`
                              ${currentDensity.td}
                              ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                              ${col.fixed === 'left' ? 'sticky left-0 bg-inherit z-10' : ''}
                              ${col.fixed === 'right' ? 'sticky right-0 bg-inherit z-10' : ''}
                              border-r last:border-r-0 border-slate-100 dark:border-slate-800/60
                              ${col.className || ''}
                            `}
                            style={{
                              width: col.width,
                              minWidth: col.minWidth,
                              maxWidth: col.maxWidth
                            }}
                          >
                            {col.render ? col.render(cellVal, record, rowIndex) : cellVal !== undefined && cellVal !== null ? String(cellVal) : '-'}
                          </td>
                        );
                      })}
                    </motion.tr>

                    {/* Expandable Row Detail */}
                    {expandable && isExpanded && expandedRowRender && (
                      <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={totalColSpan} className="p-4">
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {expandedRowRender(record)}
                            </motion.div>
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* Optional Summary Footer Row (Dense Financial / Accounting Totals) */}
          {summaryRow && (
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-semibold text-slate-900 dark:text-white select-none">
              {summaryRow}
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer */}
      {!hidePagination && (totalItems > 0 || processedData.length > 0) && (
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems || processedData.length}
            pageSizeOptions={pageSizeOptions}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectedCount={activeSelected.length}
          />
        </div>
      )}
    </div>
  );
};

export {
  DataTable,
  DataTableTextCell,
  DataTableDateCell,
  DataTableBooleanCell,
  DataTableNumericCell,
  DataTableActionMenu,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnVisibility,
  DataTableEmptyState,
  useTablePreferences
};

export default DataTable;
