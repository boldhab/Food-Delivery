import React from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

export const DataTablePagination = ({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate intelligent page numbers window
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

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground select-none ${className}`}
    >
      {/* Left: Entries Counter & Selection */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          Showing{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {startItem}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {endItem}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {totalItems}
          </span>{' '}
          entries
        </div>

        {selectedCount > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium tabular-nums border border-primary/20">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Right: Controls (Page size + Page navigation) */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
        {/* Rows per page dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Rows:</span>
            <select
              value={pageSize}
              aria-label="Rows per page"
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums cursor-pointer font-medium"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange?.(1, pageSize)}
            disabled={currentPage <= 1}
            aria-label="First page"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1, pageSize)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange?.(1, pageSize)}
                className="h-8 px-2.5 rounded-lg border border-border bg-card hover:border-primary/50 text-foreground transition-colors tabular-nums font-medium cursor-pointer"
              >
                1
              </button>
              {startPage > 2 && <span className="text-muted-foreground px-0.5">...</span>}
            </>
          )}

          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange?.(num, pageSize)}
              aria-current={currentPage === num ? 'page' : undefined}
              className={`h-8 px-2.5 rounded-lg border transition-colors tabular-nums font-semibold cursor-pointer ${
                currentPage === num
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'border-border bg-card hover:border-primary/50 text-foreground'
              }`}
            >
              {num}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-muted-foreground px-0.5">...</span>}
              <button
                type="button"
                onClick={() => onPageChange?.(totalPages, pageSize)}
                className="h-8 px-2.5 rounded-lg border border-border bg-card hover:border-primary/50 text-foreground transition-colors tabular-nums font-medium cursor-pointer"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1, pageSize)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onPageChange?.(totalPages, pageSize)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
