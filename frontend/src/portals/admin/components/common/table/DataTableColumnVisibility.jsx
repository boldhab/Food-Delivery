import React, { useState, useMemo } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FiColumns, FiCheck, FiSearch, FiRotateCcw } from 'react-icons/fi';

export const DataTableColumnVisibility = ({
  columns = [],
  columnVisibility = {},
  onToggleColumn,
  onResetColumns
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Only configurable columns (can hide or show)
  const configurableColumns = useMemo(() => {
    return columns.filter((col) => col.key && col.hideable !== false);
  }, [columns]);

  const visibleCount = useMemo(() => {
    return configurableColumns.filter((col) => columnVisibility[col.key] !== false).length;
  }, [configurableColumns, columnVisibility]);

  const filteredColumns = useMemo(() => {
    if (!search.trim()) return configurableColumns;
    const q = search.toLowerCase();
    return configurableColumns.filter(
      (c) => (c.title || c.key).toLowerCase().includes(q)
    );
  }, [configurableColumns, search]);

  if (configurableColumns.length === 0) return null;

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Customize visible columns"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <FiColumns className="w-3.5 h-3.5 text-slate-400" />
          <span>Columns</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-2xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
            {visibleCount}/{configurableColumns.length}
          </span>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 shadow-xl animate-in fade-in-0 zoom-in-95 select-none"
        >
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Toggle Columns
            </span>
            <button
              type="button"
              onClick={onResetColumns}
              className="text-2xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              title="Reset columns to default"
            >
              <FiRotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {configurableColumns.length >= 6 && (
            <div className="relative mb-2 px-1">
              <FiSearch className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search columns..."
                className="w-full pl-8 pr-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5 px-0.5">
            {filteredColumns.map((col) => {
              const isVisible = columnVisibility[col.key] !== false;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => onToggleColumn(col.key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="truncate pr-2 font-medium">{col.title || col.key}</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isVisible
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isVisible && <FiCheck className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export default DataTableColumnVisibility;
