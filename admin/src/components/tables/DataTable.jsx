import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowUp,
    FiArrowDown,
    FiSearch,
    FiFilter,
    FiDownload,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiCheck,
    FiX,
    FiClock,
    FiAlertCircle,
    FiInfo,
    FiPlus,
    FiMinus,
    FiSettings,
    FiColumns
} from 'react-icons/fi';

export interface Column<T = any> {
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    hidden?: boolean;
    sorter?: (a: T, b: T) => number;
    filterOptions?: Array<{ value: string; label: string }>;
    filterRender?: (props: FilterRenderProps) => React.ReactNode;
}

export interface FilterRenderProps {
    value: any;
    onChange: (value: any) => void;
    column: Column;
    onClose: () => void;
}

export interface DataTableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onFilter?: (filters: Record<string, any>) => void;
    onPageChange?: (page: number, pageSize: number) => void;
    onRowClick?: (record: T, index: number) => void;
    onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;
    onExport?: () => void;
    onRefresh?: () => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onView?: (record: T) => void;
    onAdd?: () => void;
    currentPage?: number;
    pageSize?: number;
    totalItems?: number;
    rowKey?: string | ((record: T) => string);
    selectable?: boolean;
    expandable?: boolean;
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    emptyMessage?: string;
    className?: string;
    height?: number | string;
    stickyHeader?: boolean;
    bordered?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    size?: 'small' | 'medium' | 'large';
    showPagination?: boolean;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    showTotal?: boolean;
    showSearch?: boolean;
    showFilters?: boolean;
    showExport?: boolean;
    showRefresh?: boolean;
    showColumnSettings?: boolean;
    rowClassName?: string | ((record: T, index: number) => string);
    onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
    components?: {
        header?: React.ComponentType<any>;
        body?: React.ComponentType<any>;
        footer?: React.ComponentType<any>;
    };
}

const DataTable = <T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    onSort,
    onFilter,
    onPageChange,
    onRowClick,
    onSelectionChange,
    onExport,
    onRefresh,
    onEdit,
    onDelete,
    onView,
    onAdd,
    currentPage = 1,
    pageSize = 10,
    totalItems = 0,
    rowKey = 'id',
    selectable = false,
    expandable = false,
    expandedRowRender,
    emptyMessage = 'No data available',
    className = '',
    height = 'auto',
    stickyHeader = false,
    bordered = true,
    striped = true,
    hoverable = true,
    size = 'medium',
    showPagination = true,
    showSizeChanger = true,
    pageSizeOptions = [10, 20, 50, 100],
    showTotal = true,
    showSearch = true,
    showFilters = true,
    showExport = true,
    showRefresh = true,
    showColumnSettings = true,
    rowClassName,
    onRow,
    components
}: DataTableProps<T>) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedRowData, setSelectedRowData] = useState<T[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [showFilterMenu, setShowFilterMenu] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [localPageSize, setLocalPageSize] = useState(pageSize);
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(columns.filter(col => !col.hidden).map(col => col.key))
    );
    const [showColumnSettingsMenu, setShowColumnSettingsMenu] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);
    const columnSettingsRef = useRef<HTMLDivElement>(null);

    // Get row key
    const getRowKey = (record: T, index: number): string => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return record[rowKey] || index.toString();
    };

    // Handle sort
    const handleSort = (key: string, sorter?: (a: T, b: T) => number) => {
        let direction: 'asc' | 'desc' = 'asc';
        
        if (sortConfig && sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortConfig({ key, direction });
        
        if (onSort) {
            onSort(key, direction);
        } else if (sorter) {
            // Client-side sorting
            const sorted = [...data].sort((a, b) => {
                const result = sorter(a, b);
                return direction === 'asc' ? result : -result;
            });
            // Update data locally (you'd need to manage this in parent)
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
            setSelectedRowData([]);
            onSelectionChange?.([], []);
        } else {
            const newSelected = new Set(data.map((item, index) => getRowKey(item, index)));
            setSelectedRows(newSelected);
            setSelectedRowData(data);
            onSelectionChange?.(Array.from(newSelected), data);
        }
    };

    // Handle select row
    const handleSelectRow = (key: string, record: T) => {
        const newSelected = new Set(selectedRows);
        const newSelectedData = [...selectedRowData];
        
        if (newSelected.has(key)) {
            newSelected.delete(key);
            const index = newSelectedData.findIndex(item => getRowKey(item, 0) === key);
            if (index > -1) newSelectedData.splice(index, 1);
        } else {
            newSelected.add(key);
            newSelectedData.push(record);
        }
        
        setSelectedRows(newSelected);
        setSelectedRowData(newSelectedData);
        onSelectionChange?.(Array.from(newSelected), newSelectedData);
    };

    // Handle expand row
    const handleExpandRow = (key: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedRows(newExpanded);
    };

    // Handle filter
    const handleFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === null || value === undefined) {
            delete newFilters[key];
        }
        setFilters(newFilters);
        onFilter?.(newFilters);
        setShowFilterMenu(null);
    };

    // Clear filter
    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters(newFilters);
        onFilter?.(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({});
        onFilter?.({});
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setLocalCurrentPage(page);
        onPageChange?.(page, localPageSize);
    };

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setLocalPageSize(newSize);
        setLocalCurrentPage(1);
        onPageChange?.(1, newSize);
    };

    // Toggle column visibility
    const toggleColumn = (key: string) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    // Reset column visibility
    const resetColumns = () => {
        setVisibleColumns(new Set(columns.filter(col => !col.hidden).map(col => col.key)));
    };

    // Get visible columns
    const getVisibleColumns = useMemo(() => {
        return columns.filter(col => visibleColumns.has(col.key));
    }, [columns, visibleColumns]);

    // Get sort icon
    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <FiArrowUp className="w-3 h-3 opacity-30" />;
        }
        return sortConfig.direction === 'asc' ? 
            <FiArrowUp className="w-3 h-3 text-orange-500" /> : 
            <FiArrowDown className="w-3 h-3 text-orange-500" />;
    };

    // Size classes
    const sizeClasses = {
        small: {
            cell: 'py-2 px-3 text-xs',
            header: 'py-3 px-3 text-xs font-semibold'
        },
        medium: {
            cell: 'py-3 px-4 text-sm',
            header: 'py-4 px-4 text-sm font-semibold'
        },
        large: {
            cell: 'py-4 px-6 text-base',
            header: 'py-5 px-6 text-base font-semibold'
        }
    };

    // Filter Menu Component
    const FilterMenu = ({ column, onClose }: { column: Column; onClose: () => void }) => {
        const currentValue = filters[column.key];

        if (column.filterRender) {
            return column.filterRender({
                value: currentValue,
                onChange: (value) => handleFilter(column.key, value),
                column,
                onClose
            });
        }

        if (column.filterOptions) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 mt-2 p-2 bg-white dark:bg-slate-800
                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                             min-w-[200px]"
                >
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                handleFilter(column.key, '');
                                onClose();
                            }}
                            className="w-full px-3 py-2 text-left text-sm
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-colors"
                        >
                            All
                        </button>
                        {column.filterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    handleFilter(column.key, option.value);
                                    onClose();
                                }}
                                className={`
                                    w-full px-3 py-2 text-left text-sm rounded-lg
                                    transition-colors
                                    ${currentValue === option.value
                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 p-4 bg-white dark:bg-slate-800
                         rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                         min-w-[200px]"
            >
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                    Filter by {column.title}
                </h4>
                <input
                    type="text"
                    value={currentValue || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    placeholder={`Enter ${column.title.toLowerCase()}...`}
                    className="w-full px-3 py-2 mb-3 bg-slate-50 dark:bg-slate-900
                             border border-slate-200 dark:border-slate-700
                             rounded-lg text-sm
                             focus:outline-none focus:border-orange-500
                             focus:ring-2 focus:ring-orange-500/20"
                    autoFocus
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            handleFilter(column.key, currentValue);
                            onClose();
                        }}
                        className="flex-1 px-3 py-1.5 bg-orange-500 text-white
                                 rounded-lg text-sm hover:bg-orange-600
                                 transition-colors duration-200"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => {
                            clearFilter(column.key);
                            onClose();
                        }}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700
                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                 transition-colors duration-200"
                    >
                        Clear
                    </button>
                </div>
            </motion.div>
        );
    };

    // Column Settings Menu
    const ColumnSettingsMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800
                     rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                     p-2 z-50"
            ref={columnSettingsRef}
        >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Visible Columns
                </h4>
            </div>
            <div className="py-2 space-y-1">
                {columns.map(column => (
                    <label
                        key={column.key}
                        className="flex items-center gap-2 px-3 py-2
                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                 rounded-lg cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={visibleColumns.has(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            className="w-4 h-4 text-orange-500 border-slate-300
                                     rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            {column.title}
                        </span>
                    </label>
                ))}
            </div>
            <div className="p-2 border-t border-slate-200 dark:border-slate-700
                          flex justify-between">
                <button
                    onClick={resetColumns}
                    className="text-xs text-orange-500 hover:text-orange-600"
                >
                    Reset
                </button>
                <button
                    onClick={() => setShowColumnSettingsMenu(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                >
                    Close
                </button>
            </div>
        </motion.div>
    );

    // Pagination Component
    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / localPageSize);
        const pageNumbers = [];
        
        let startPage = Math.max(1, localCurrentPage - 2);
        let endPage = Math.min(totalPages, localCurrentPage + 2);
        
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(5, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 4);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    {showTotal && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {((localCurrentPage - 1) * localPageSize) + 1} to{' '}
                            {Math.min(localCurrentPage * localPageSize, totalItems)} of{' '}
                            {totalItems} entries
                        </div>
                    )}
                    
                    {showSizeChanger && (
                        <select
                            value={localPageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm text-slate-700 dark:text-slate-300
                                     focus:outline-none focus:border-orange-500"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={localCurrentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors
                                 text-slate-600 dark:text-slate-400
                                 hover:text-orange-500"
                    >
                        <FiChevronsLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => handlePageChange(localCurrentPage - 1)}
                        disabled={localCurrentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors
                                 text-slate-600 dark:text-slate-400
                                 hover:text-orange-500"
                    >
                        <FiChevronLeft className="w-4 h-4" />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => handlePageChange(1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200
                                         dark:border-slate-700 hover:border-orange-500
                                         transition-colors text-sm
                                         text-slate-600 dark:text-slate-400"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="text-slate-400">...</span>}
                        </>
                    )}

                    {pageNumbers.map(num => (
                        <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            className={`
                                px-3 py-1.5 rounded-lg border transition-colors text-sm
                                ${localCurrentPage === num
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-500 text-slate-600 dark:text-slate-400'
                                }
                            `}
                        >
                            {num}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200
                                         dark:border-slate-700 hover:border-orange-500
                                         transition-colors text-sm
                                         text-slate-600 dark:text-slate-400"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => handlePageChange(localCurrentPage + 1)}
                        disabled={localCurrentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors
                                 text-slate-600 dark:text-slate-400
                                 hover:text-orange-500"
                    >
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={localCurrentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors
                                 text-slate-600 dark:text-slate-400
                                 hover:text-orange-500"
                    >
                        <FiChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ${className}`}>
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {showSearch && (
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm w-64
                                             focus:outline-none focus:border-orange-500
                                             focus:ring-2 focus:ring-orange-500/20"
                                />
                            </div>
                        )}

                        {selectable && selectedRows.size > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {selectedRows.size} selected
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedRows(new Set());
                                        setSelectedRowData([]);
                                        onSelectionChange?.([], []);
                                    }}
                                    className="text-xs text-orange-500 hover:text-orange-600"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                         text-white rounded-lg transition-colors
                                         flex items-center gap-2 text-sm font-medium"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add New
                            </button>
                        )}

                        {showExport && onExport && (
                            <button
                                onClick={onExport}
                                className="p-2 text-slate-500 hover:text-orange-500
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-colors"
                                title="Export data"
                            >
                                <FiDownload className="w-4 h-4" />
                            </button>
                        )}
                        
                        {showRefresh && onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 text-slate-500 hover:text-orange-500
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        )}

                        {showColumnSettings && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowColumnSettingsMenu(!showColumnSettingsMenu)}
                                    className="p-2 text-slate-500 hover:text-orange-500
                                             hover:bg-slate-100 dark:hover:bg-slate-700
                                             rounded-lg transition-colors"
                                    title="Column settings"
                                >
                                    <FiColumns className="w-4 h-4" />
                                </button>
                                
                                <AnimatePresence>
                                    {showColumnSettingsMenu && <ColumnSettingsMenu />}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active filters */}
                {Object.keys(filters).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs text-slate-500">Active filters:</span>
                        {Object.entries(filters).map(([key, value]) => {
                            const column = columns.find(c => c.key === key);
                            if (!value) return null;
                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-1
                                             bg-orange-50 dark:bg-orange-900/20
                                             text-orange-700 dark:text-orange-300
                                             rounded-full text-xs"
                                >
                                    {column?.title}: {value}
                                    <button
                                        onClick={() => clearFilter(key)}
                                        className="ml-1 hover:text-orange-900"
                                    >
                                        <FiX className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-slate-500 hover:text-orange-500"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div 
                ref={tableRef}
                className="overflow-auto"
                style={{ maxHeight: height }}
            >
                <table className="w-full border-collapse">
                    {/* Header */}
                    <thead className={stickyHeader ? 'sticky top-0 bg-white dark:bg-slate-800 z-10' : ''}>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            {/* Selection */}
                            {selectable && (
                                <th className={`${sizeClasses[size].header} text-center w-10`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-orange-500 border-slate-300
                                                 rounded focus:ring-orange-500"
                                    />
                                </th>
                            )}

                            {/* Expand */}
                            {expandable && (
                                <th className={`${sizeClasses[size].header} text-center w-10`} />
                            )}

                            {/* Columns */}
                            {getVisibleColumns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`
                                        ${sizeClasses[size].header}
                                        text-${col.align || 'left'}
                                        ${col.fixed === 'left' ? 'sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-20' : ''}
                                        ${col.fixed === 'right' ? 'sticky right-0 bg-slate-50 dark:bg-slate-900/50 z-20' : ''}
                                        border-r last:border-r-0 border-slate-200 dark:border-slate-700
                                        whitespace-nowrap
                                    `}
                                    style={{ 
                                        width: col.width,
                                        cursor: col.sortable ? 'pointer' : 'default'
                                    }}
                                    onClick={() => col.sortable && handleSort(col.key, col.sorter)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{col.title}</span>
                                        
                                        {col.sortable && (
                                            <span className="flex items-center">
                                                {getSortIcon(col.key)}
                                            </span>
                                        )}
                                        
                                        {col.filterable && showFilters && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowFilterMenu(
                                                            showFilterMenu === col.key ? null : col.key
                                                        );
                                                    }}
                                                    className={`
                                                        p-1 rounded hover:bg-white dark:hover:bg-slate-700
                                                        ${filters[col.key] ? 'text-orange-500' : 'text-slate-400'}
                                                    `}
                                                >
                                                    <FiFilter className="w-3 h-3" />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {showFilterMenu === col.key && (
                                                        <FilterMenu 
                                                            column={col} 
                                                            onClose={() => setShowFilterMenu(null)} 
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {/* Actions */}
                            {(onView || onEdit || onDelete) && (
                                <th className={`${sizeClasses[size].header} text-center w-24`}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {loading ? (
                            // Loading skeleton
                            [...Array(5)].map((_, rowIndex) => (
                                <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-200 dark:border-slate-700">
                                    {selectable && (
                                        <td className={sizeClasses[size].cell}>
                                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        </td>
                                    )}
                                    {expandable && (
                                        <td className={sizeClasses[size].cell}>
                                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        </td>
                                    )}
                                    {getVisibleColumns.map((col) => (
                                        <td key={col.key} className={sizeClasses[size].cell}>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                                        </td>
                                    ))}
                                    {(onView || onEdit || onDelete) && (
                                        <td className={sizeClasses[size].cell}>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16 mx-auto" />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            // Empty state
                            <tr>
                                <td 
                                    colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)} 
                                    className="py-12 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-6xl mb-4">📊</div>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                            {emptyMessage}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {onAdd ? 'Click "Add New" to create your first entry' : 'No data to display'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // Data rows
                            data.map((record, rowIndex) => {
                                const key = getRowKey(record, rowIndex);
                                const isSelected = selectedRows.has(key);
                                const isExpanded = expandedRows.has(key);
                                const isHovered = hoveredRow === key;

                                const rowClasses = [
                                    'border-b border-slate-200 dark:border-slate-700 transition-colors duration-200',
                                    striped && rowIndex % 2 === 1 ? 'bg-slate-50 dark:bg-slate-900/50' : '',
                                    hoverable ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : '',
                                    isSelected ? 'bg-orange-50 dark:bg-orange-900/20' : '',
                                    onRowClick ? 'cursor-pointer' : '',
                                    typeof rowClassName === 'function' ? rowClassName(record, rowIndex) : rowClassName
                                ].filter(Boolean).join(' ');

                                return (
                                    <React.Fragment key={key}>
                                        <tr
                                            className={rowClasses}
                                            onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT' && 
                                                    (e.target as HTMLElement).tagName !== 'BUTTON') {
                                                    onRowClick?.(record, rowIndex);
                                                }
                                            }}
                                            onMouseEnter={() => setHoveredRow(key)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            {...onRow?.(record, rowIndex)}
                                        >
                                            {/* Selection */}
                                            {selectable && (
                                                <td className={`${sizeClasses[size].cell} text-center`} onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(key, record)}
                                                        className="w-4 h-4 text-orange-500 border-slate-300
                                                                 rounded focus:ring-orange-500"
                                                    />
                                                </td>
                                            )}

                                            {/* Expand */}
                                            {expandable && (
                                                <td className={`${sizeClasses[size].cell} text-center`} onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleExpandRow(key)}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700
                                                                 rounded transition-colors"
                                                    >
                                                        {isExpanded ? 
                                                            <FiMinus className="w-4 h-4" /> : 
                                                            <FiPlus className="w-4 h-4" />
                                                        }
                                                    </button>
                                                </td>
                                            )}

                                            {/* Data */}
                                            {getVisibleColumns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`
                                                        ${sizeClasses[size].cell}
                                                        text-${col.align || 'left'}
                                                        ${col.fixed === 'left' ? 'sticky left-0 bg-inherit' : ''}
                                                        ${col.fixed === 'right' ? 'sticky right-0 bg-inherit' : ''}
                                                        border-r last:border-r-0 border-slate-200 dark:border-slate-700
                                                    `}
                                                    style={{ width: col.width }}
                                                >
                                                    {col.render 
                                                        ? col.render(record[col.key], record, rowIndex)
                                                        : record[col.key]?.toString() || '-'
                                                    }
                                                </td>
                                            ))}

                                            {/* Actions */}
                                            {(onView || onEdit || onDelete) && (
                                                <td className={`${sizeClasses[size].cell} text-center`} onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {onView && (
                                                            <button
                                                                onClick={() => onView(record)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-500
                                                                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                                                                         rounded transition-colors"
                                                                title="View"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {onEdit && (
                                                            <button
                                                                onClick={() => onEdit(record)}
                                                                className="p-1.5 text-slate-500 hover:text-green-500
                                                                         hover:bg-green-50 dark:hover:bg-green-900/20
                                                                         rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {onDelete && (
                                                            <button
                                                                onClick={() => onDelete(record)}
                                                                className="p-1.5 text-slate-500 hover:text-red-500
                                                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                                                         rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>

                                        {/* Expanded Row */}
                                        {expandable && isExpanded && expandedRowRender && (
                                            <tr>
                                                <td 
                                                    colSpan={columns.length + (selectable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)} 
                                                    className="p-4 bg-slate-50 dark:bg-slate-900/50"
                                                >
                                                    {expandedRowRender(record, rowIndex)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {showPagination && totalItems > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <Pagination />
                </div>
            )}
        </div>
    );
};

export default DataTable;