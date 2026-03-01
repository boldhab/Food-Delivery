import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FiTrash2
} from "react-icons/fi";
const DataTable = ({
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
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  rowKey = "_id",
  selectable = false,
  expandable = false,
  expandedRowRender,
  emptyMessage = "No data available",
  className = "",
  height = "auto",
  stickyHeader = false,
  bordered = true,
  striped = true,
  hoverable = true,
  size = "medium"
}) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [selectedRows, setSelectedRows] = useState(/* @__PURE__ */ new Set());
  const [expandedRows, setExpandedRows] = useState(/* @__PURE__ */ new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilterMenu, setShowFilterMenu] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const filterRef = useRef(null);
  const tableRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(/* @__PURE__ */ new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(data.map((item) => item[rowKey]));
      setSelectedRows(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    }
  };
  const handleSelectRow = (key) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };
  const handleExpandRow = (key) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };
  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FiArrowUp className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === "asc" ? <FiArrowUp className="w-3 h-3 text-orange-500" /> : <FiArrowDown className="w-3 h-3 text-orange-500" />;
  };
  const FilterMenu = ({ column, onClose }) => {
    const [filterValue, setFilterValue] = useState(filters[column.key] || "");
    const applyFilter = () => {
      const newFilters = { ...filters, [column.key]: filterValue };
      setFilters(newFilters);
      onFilter?.(newFilters);
      onClose();
    };
    const clearFilter = () => {
      const newFilters = { ...filters };
      delete newFilters[column.key];
      setFilters(newFilters);
      onFilter?.(newFilters);
      setFilterValue("");
      onClose();
    };
    return <motion.div
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
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
      placeholder={`Enter ${column.title.toLowerCase()}...`}
      className="w-full px-3 py-2 mb-3 bg-slate-50 dark:bg-slate-900
                             border border-slate-200 dark:border-slate-700
                             rounded-lg text-sm
                             focus:outline-none focus:border-orange-500"
    />
                <div className="flex gap-2">
                    <button
      onClick={applyFilter}
      className="flex-1 px-3 py-1.5 bg-orange-500 text-white
                                 rounded-lg text-sm hover:bg-orange-600
                                 transition-colors duration-200"
    >
                        Apply
                    </button>
                    <button
      onClick={clearFilter}
      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700
                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                 transition-colors duration-200"
    >
                        Clear
                    </button>
                </div>
            </motion.div>;
  };
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
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
    return <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                </div>
                
                <div className="flex items-center gap-2">
                    <button
      onClick={() => onPageChange?.(1, pageSize)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors"
    >
                        <FiChevronsLeft className="w-4 h-4" />
                    </button>
                    
                    <button
      onClick={() => onPageChange?.(currentPage - 1, pageSize)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors"
    >
                        <FiChevronLeft className="w-4 h-4" />
                    </button>

                    {startPage > 1 && <>
                            <button
      onClick={() => onPageChange?.(1, pageSize)}
      className="px-3 py-1 rounded-lg border border-slate-200
                                         dark:border-slate-700 hover:border-orange-500
                                         transition-colors"
    >
                                1
                            </button>
                            {startPage > 2 && <span className="text-slate-400">...</span>}
                        </>}

                    {pageNumbers.map((num) => <button
      key={num}
      onClick={() => onPageChange?.(num, pageSize)}
      className={`
                                px-3 py-1 rounded-lg border transition-colors
                                ${currentPage === num ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 dark:border-slate-700 hover:border-orange-500"}
                            `}
    >
                            {num}
                        </button>)}

                    {endPage < totalPages && <>
                            {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
                            <button
      onClick={() => onPageChange?.(totalPages, pageSize)}
      className="px-3 py-1 rounded-lg border border-slate-200
                                         dark:border-slate-700 hover:border-orange-500
                                         transition-colors"
    >
                                {totalPages}
                            </button>
                        </>}

                    <button
      onClick={() => onPageChange?.(currentPage + 1, pageSize)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors"
    >
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                    
                    <button
      onClick={() => onPageChange?.(totalPages, pageSize)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:border-orange-500 transition-colors"
    >
                        <FiChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>;
  };
  const sizeClasses = {
    small: "py-2 px-3 text-sm",
    medium: "py-3 px-4 text-sm",
    large: "py-4 px-6 text-base"
  };
  return <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ${className}`}>
            {
    /* Table Toolbar */
  }
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {
    /* Search */
  }
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm w-64
                                     focus:outline-none focus:border-orange-500"
  />
                    </div>

                    {
    /* Selected Count */
  }
                    {selectable && selectedRows.size > 0 && <span className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedRows.size} selected
                        </span>}
                </div>

                <div className="flex items-center gap-2">
                    {onExport && <button
    onClick={onExport}
    className="p-2 text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-colors"
    title="Export data"
  >
                            <FiDownload className="w-4 h-4" />
                        </button>}
                    
                    {onRefresh && <button
    onClick={onRefresh}
    className="p-2 text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-colors"
    title="Refresh"
  >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>}
                </div>
            </div>

            {
    /* Table Container */
  }
            <div
    ref={tableRef}
    className="overflow-auto"
    style={{ maxHeight: height }}
  >
                <table className="w-full border-collapse">
                    {
    /* Table Header */
  }
                    <thead className={stickyHeader ? "sticky top-0 bg-white dark:bg-slate-800 z-10" : ""}>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            {
    /* Selection Column */
  }
                            {selectable && <th className="py-3 px-4 text-left">
                                    <input
    type="checkbox"
    checked={selectedRows.size === data.length && data.length > 0}
    onChange={handleSelectAll}
    className="w-4 h-4 text-orange-500 border-slate-300
                                                 rounded focus:ring-orange-500"
  />
                                </th>}

                            {
    /* Expand Column */
  }
                            {expandable && <th className="py-3 px-4 text-left w-10" />}

                            {
    /* Data Columns */
  }
                            {columns.map((col) => <th
    key={col.key}
    className={`
                                        ${sizeClasses[size]}
                                        text-${col.align || "left"}
                                        ${col.fixed === "left" ? "sticky left-0 bg-white dark:bg-slate-800" : ""}
                                        ${col.fixed === "right" ? "sticky right-0 bg-white dark:bg-slate-800" : ""}
                                        font-semibold text-slate-900 dark:text-white
                                        border-r last:border-r-0 border-slate-200 dark:border-slate-700
                                    `}
    style={{
      width: col.width,
      cursor: col.sortable ? "pointer" : "default"
    }}
  >
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => col.sortable && handleSort(col.key)}>
                                            {col.title}
                                        </span>
                                        
                                        {col.sortable && <span className="flex items-center">
                                                {getSortIcon(col.key)}
                                            </span>}
                                        
                                        {col.filterable && <div className="relative" ref={filterRef}>
                                                <button
    onClick={() => setShowFilterMenu(
      showFilterMenu === col.key ? null : col.key
    )}
    className={`
                                                        p-1 rounded hover:bg-slate-100
                                                        dark:hover:bg-slate-700
                                                        ${filters[col.key] ? "text-orange-500" : "text-slate-400"}
                                                    `}
  >
                                                    <FiFilter className="w-3 h-3" />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {showFilterMenu === col.key && <FilterMenu
    column={col}
    onClose={() => setShowFilterMenu(null)}
  />}
                                                </AnimatePresence>
                                            </div>}
                                    </div>
                                </th>)}

                            {
    /* Actions Column */
  }
                            {(onView || onEdit || onDelete) && <th className={`${sizeClasses[size]} text-right font-semibold text-slate-900 dark:text-white`}>
                                    Actions
                                </th>}
                        </tr>
                    </thead>

                    {
    /* Table Body */
  }
                    <tbody>
                        {loading ? (
    // Loading skeleton
    [...Array(5)].map((_, rowIndex) => <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-200 dark:border-slate-700">
                                    {selectable && <td className="py-3 px-4">
                                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        </td>}
                                    {expandable && <td className="py-3 px-4">
                                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        </td>}
                                    {columns.map((col) => <td key={col.key} className={`${sizeClasses[size]} border-r last:border-r-0 border-slate-200 dark:border-slate-700`}>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                                        </td>)}
                                    {(onView || onEdit || onDelete) && <td className={`${sizeClasses[size]} text-right`}>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16 ml-auto" />
                                        </td>}
                                </tr>)
  ) : data.length === 0 ? (
    // Empty state
    <tr>
                                <td
      colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (onView || onEdit || onDelete ? 1 : 0)}
      className="py-12 text-center"
    >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-6xl mb-4">📊</div>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                            {emptyMessage}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Try adjusting your filters or add new data
                                        </p>
                                    </div>
                                </td>
                            </tr>
  ) : (
    // Data rows
    data.map((record, rowIndex) => {
      const key = record[rowKey] || rowIndex;
      const isSelected = selectedRows.has(key);
      const isExpanded = expandedRows.has(key);
      const isHovered = hoveredRow === key;
      return <React.Fragment key={key}>
                                        <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rowIndex * 0.03 }}
        className={`
                                                border-b border-slate-200 dark:border-slate-700
                                                transition-colors duration-200
                                                ${striped && rowIndex % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/50" : ""}
                                                ${hoverable ? "hover:bg-slate-50 dark:hover:bg-slate-800" : ""}
                                                ${isSelected ? "bg-orange-50 dark:bg-orange-900/20" : ""}
                                                ${onRowClick ? "cursor-pointer" : ""}
                                            `}
        onClick={() => onRowClick?.(record)}
        onMouseEnter={() => setHoveredRow(key)}
        onMouseLeave={() => setHoveredRow(null)}
      >
                                            {
        /* Selection Column */
      }
                                            {selectable && <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
        type="checkbox"
        checked={isSelected}
        onChange={() => handleSelectRow(key)}
        className="w-4 h-4 text-orange-500 border-slate-300
                                                                 rounded focus:ring-orange-500"
      />
                                                </td>}

                                            {
        /* Expand Column */
      }
                                            {expandable && <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <button
        onClick={() => handleExpandRow(key)}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700
                                                                 rounded transition-colors"
      >
                                                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                                    </button>
                                                </td>}

                                            {
        /* Data Columns */
      }
                                            {columns.map((col) => <td
        key={col.key}
        className={`
                                                        ${sizeClasses[size]}
                                                        text-${col.align || "left"}
                                                        ${col.fixed === "left" ? "sticky left-0 bg-inherit" : ""}
                                                        ${col.fixed === "right" ? "sticky right-0 bg-inherit" : ""}
                                                        border-r last:border-r-0 border-slate-200 dark:border-slate-700
                                                    `}
        style={{ width: col.width }}
      >
                                                    {col.render ? col.render(record[col.key], record) : record[col.key]}
                                                </td>)}

                                            {
        /* Actions Column */
      }
                                            {(onView || onEdit || onDelete) && <td className={`${sizeClasses[size]} text-right`} onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {onView && <button
        onClick={() => onView(record)}
        className="p-1.5 text-slate-500 hover:text-blue-500
                                                                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                                                                         rounded transition-colors"
        title="View"
      >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>}
                                                        {onEdit && <button
        onClick={() => onEdit(record)}
        className="p-1.5 text-slate-500 hover:text-green-500
                                                                         hover:bg-green-50 dark:hover:bg-green-900/20
                                                                         rounded transition-colors"
        title="Edit"
      >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>}
                                                        {onDelete && <button
        onClick={() => onDelete(record)}
        className="p-1.5 text-slate-500 hover:text-red-500
                                                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                                                         rounded transition-colors"
        title="Delete"
      >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>}
                                                    </div>
                                                </td>}
                                        </motion.tr>

                                        {
        /* Expanded Row */
      }
                                        {expandable && isExpanded && expandedRowRender && <motion.tr
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
                                                <td
        colSpan={columns.length + (selectable ? 1 : 0) + (onView || onEdit || onDelete ? 1 : 0)}
        className="p-4 bg-slate-50 dark:bg-slate-900/50"
      >
                                                    {expandedRowRender(record)}
                                                </td>
                                            </motion.tr>}
                                    </React.Fragment>;
    })
  )}
                    </tbody>
                </table>
            </div>

            {
    /* Table Footer */
  }
            {totalItems > 0 && <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <Pagination />
                </div>}
        </div>;
};
var stdin_default = DataTable;
export {
  stdin_default as default
};
