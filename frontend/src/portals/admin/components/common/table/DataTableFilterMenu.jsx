import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiFilter } from 'react-icons/fi';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export const DataTableFilterMenu = ({
  column,
  currentValue,
  onApplyFilter,
  onClearFilter
}) => {
  const [open, setOpen] = useState(false);
  const filterConfig = typeof column.filterable === 'object' ? column.filterable : { type: 'text' };
  const filterType = filterConfig.type || 'text';

  // Local state for filter inputs
  const [textVal, setTextVal] = useState(currentValue || '');
  const [rangeVal, setRangeVal] = useState(
    currentValue && typeof currentValue === 'object' ? currentValue : { min: '', max: '' }
  );
  const [dateVal, setDateVal] = useState(
    currentValue && typeof currentValue === 'object' ? currentValue : { start: '', end: '' }
  );
  const [selectedOptions, setSelectedOptions] = useState(
    Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []
  );

  useEffect(() => {
    if (filterType === 'text') {
      setTextVal(currentValue || '');
    } else if (filterType === 'number-range') {
      setRangeVal(currentValue && typeof currentValue === 'object' ? currentValue : { min: '', max: '' });
    } else if (filterType === 'date-range') {
      setDateVal(currentValue && typeof currentValue === 'object' ? currentValue : { start: '', end: '' });
    } else if (filterType === 'select' || filterType === 'multi-select') {
      setSelectedOptions(Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []);
    }
  }, [currentValue, filterType, open]);

  const hasActiveFilter = Boolean(
    (filterType === 'text' && textVal) ||
    (filterType === 'number-range' && (rangeVal.min !== '' || rangeVal.max !== '')) ||
    (filterType === 'date-range' && (dateVal.start || dateVal.end)) ||
    ((filterType === 'select' || filterType === 'multi-select') && selectedOptions.length > 0) ||
    (filterType === 'boolean' && currentValue !== undefined && currentValue !== '')
  );

  const handleApply = () => {
    if (filterType === 'text') {
      if (textVal.trim()) onApplyFilter(column.key, textVal.trim());
      else onClearFilter(column.key);
    } else if (filterType === 'number-range') {
      if (rangeVal.min !== '' || rangeVal.max !== '') onApplyFilter(column.key, rangeVal);
      else onClearFilter(column.key);
    } else if (filterType === 'date-range') {
      if (dateVal.start || dateVal.end) onApplyFilter(column.key, dateVal);
      else onClearFilter(column.key);
    } else if (filterType === 'select') {
      if (selectedOptions.length > 0) onApplyFilter(column.key, selectedOptions[0]);
      else onClearFilter(column.key);
    } else if (filterType === 'multi-select') {
      if (selectedOptions.length > 0) onApplyFilter(column.key, selectedOptions);
      else onClearFilter(column.key);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setTextVal('');
    setRangeVal({ min: '', max: '' });
    setDateVal({ start: '', end: '' });
    setSelectedOptions([]);
    onClearFilter(column.key);
    setOpen(false);
  };

  const toggleOption = (val) => {
    if (filterType === 'select') {
      setSelectedOptions([val]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
      );
    }
  };

  return (
    <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label={`Filter by ${column.title}`}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              hasActiveFilter ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <FiFilter className={`w-3 h-3 ${hasActiveFilter ? 'stroke-[2.5]' : ''}`} />
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[220px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl animate-in fade-in-0 zoom-in-95"
          >
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Filter {column.title}</span>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-2xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Type: Text */}
            {filterType === 'text' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  placeholder={`Search ${column.title.toLowerCase()}...`}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
            )}

            {/* Filter Type: Number Range */}
            {filterType === 'number-range' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Min</label>
                    <input
                      type="number"
                      value={rangeVal.min}
                      onChange={(e) => setRangeVal((p) => ({ ...p, min: e.target.value }))}
                      placeholder="0"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Max</label>
                    <input
                      type="number"
                      value={rangeVal.max}
                      onChange={(e) => setRangeVal((p) => ({ ...p, max: e.target.value }))}
                      placeholder="Max"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filter Type: Date Range */}
            {filterType === 'date-range' && (
              <div className="space-y-2">
                <div>
                  <label className="text-2xs text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    value={dateVal.start}
                    onChange={(e) => setDateVal((p) => ({ ...p, start: e.target.value }))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-2xs text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    value={dateVal.end}
                    onChange={(e) => setDateVal((p) => ({ ...p, end: e.target.value }))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Filter Type: Select / Multi-Select */}
            {(filterType === 'select' || filterType === 'multi-select') && filterConfig.options && (
              <div className="max-h-48 overflow-y-auto space-y-1 mb-2">
                {filterConfig.options.map((opt) => {
                  const optVal = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  const isChecked = selectedOptions.includes(optVal);

                  return (
                    <button
                      key={String(optVal)}
                      type="button"
                      onClick={() => toggleOption(optVal)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <span className="truncate pr-2">{optLabel}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isChecked && <FiCheck className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filter Type: Boolean */}
            {filterType === 'boolean' && (
              <div className="space-y-1 mb-2">
                {[
                  { value: '', label: 'All' },
                  { value: true, label: filterConfig.trueLabel || 'Yes / Active' },
                  { value: false, label: filterConfig.falseLabel || 'No / Inactive' }
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      if (opt.value === '') onClearFilter(column.key);
                      else onApplyFilter(column.key, opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentValue === opt.value
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {currentValue === opt.value && <FiCheck className="w-3 h-3 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}

            {/* Actions: Apply & Clear */}
            {filterType !== 'boolean' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};

export default DataTableFilterMenu;
