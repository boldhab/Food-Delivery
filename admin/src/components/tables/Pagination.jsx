import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiMoreHorizontal,
    FiArrowLeft,
    FiArrowRight,
    FiSkipBack,
    FiSkipForward
} from 'react-icons/fi';

export interface PaginationProps {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number, pageSize: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: boolean | ((total: number, range: [number, number]) => string);
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    showPageNumbers?: boolean;
    showPageSize?: boolean;
    disabled?: boolean;
    simple?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'minimal' | 'compact' | 'rounded';
    position?: 'left' | 'center' | 'right';
    className?: string;
    hideOnSinglePage?: boolean;
    itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: React.ReactNode) => React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage: externalCurrentPage = 1,
    totalPages: externalTotalPages,
    totalItems = 0,
    pageSize: externalPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onPageSizeChange,
    showSizeChanger = true,
    showQuickJumper = false,
    showTotal = true,
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showPageSize = true,
    disabled = false,
    simple = false,
    size = 'medium',
    variant = 'default',
    position = 'right',
    className = '',
    hideOnSinglePage = true,
    itemRender
}) => {
    const [currentPage, setCurrentPage] = useState(externalCurrentPage);
    const [pageSize, setPageSize] = useState(externalPageSize);
    const [jumpPage, setJumpPage] = useState('');
    const [showJumpInput, setShowJumpInput] = useState(false);

    // Calculate total pages
    const totalPages = externalTotalPages || Math.ceil(totalItems / pageSize);

    // Update internal state when props change
    useEffect(() => {
        setCurrentPage(externalCurrentPage);
    }, [externalCurrentPage]);

    useEffect(() => {
        setPageSize(externalPageSize);
    }, [externalPageSize]);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage || disabled) return;
        
        setCurrentPage(page);
        onPageChange(page, pageSize);
    };

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
        onPageChange(1, newSize);
        onPageSizeChange?.(newSize);
    };

    // Handle jump
    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(jumpPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setJumpPage('');
            setShowJumpInput(false);
        }
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    // Size classes
    const sizeClasses = {
        small: {
            container: 'h-8 text-xs',
            item: 'min-w-[2rem] h-8 px-2',
            icon: 'w-3.5 h-3.5',
            select: 'h-8 text-xs py-1'
        },
        medium: {
            container: 'h-10 text-sm',
            item: 'min-w-[2.5rem] h-10 px-3',
            icon: 'w-4 h-4',
            select: 'h-10 text-sm py-2'
        },
        large: {
            container: 'h-12 text-base',
            item: 'min-w-[3rem] h-12 px-4',
            icon: 'w-5 h-5',
            select: 'h-12 text-base py-3'
        }
    };

    // Variant classes
    const variantClasses = {
        default: {
            item: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
            active: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
            disabled: 'opacity-50 cursor-not-allowed hover:bg-transparent'
        },
        minimal: {
            item: 'hover:bg-slate-100 dark:hover:bg-slate-800',
            active: 'text-orange-500 font-semibold',
            disabled: 'opacity-40 cursor-not-allowed'
        },
        compact: {
            item: 'border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
            active: 'bg-orange-100 dark:bg-orange-900/20 text-orange-500 font-semibold',
            disabled: 'opacity-40 cursor-not-allowed'
        },
        rounded: {
            item: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full',
            active: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
            disabled: 'opacity-50 cursor-not-allowed hover:bg-transparent'
        }
    };

    // Position classes
    const positionClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    // Hide on single page
    if (hideOnSinglePage && totalPages <= 1) {
        return null;
    }

    // Simple mode
    if (simple) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || disabled}
                    className={`
                        flex items-center gap-1 px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${sizeClasses[size].container}
                        ${variantClasses[variant].item}
                        ${(currentPage === 1 || disabled) ? variantClasses[variant].disabled : ''}
                    `}
                >
                    <FiArrowLeft className={sizeClasses[size].icon} />
                    <span>Previous</span>
                </button>
                
                <span className="px-4 text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                </span>
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || disabled}
                    className={`
                        flex items-center gap-1 px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${sizeClasses[size].container}
                        ${variantClasses[variant].item}
                        ${(currentPage === totalPages || disabled) ? variantClasses[variant].disabled : ''}
                    `}
                >
                    <span>Next</span>
                    <FiArrowRight className={sizeClasses[size].icon} />
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap items-center gap-4 ${positionClasses[position]} ${className}`}>
            {/* Total items */}
            {showTotal && totalItems > 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    {typeof showTotal === 'function' 
                        ? showTotal(totalItems, [(currentPage - 1) * pageSize + 1, Math.min(currentPage * pageSize, totalItems)])
                        : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} entries`
                    }
                </div>
            )}

            {/* Page size selector */}
            {showSizeChanger && showPageSize && (
                <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    disabled={disabled}
                    className={`
                        px-3 rounded-lg border border-slate-200 dark:border-slate-700
                        bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                        focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                        transition-all duration-200
                        ${sizeClasses[size].select}
                    `}
                >
                    {pageSizeOptions.map(size => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>
            )}

            {/* Pagination controls */}
            <nav className="flex items-center gap-1">
                {/* First page */}
                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || disabled}
                        className={`
                            flex items-center justify-center rounded-lg
                            transition-all duration-200
                            ${sizeClasses[size].item}
                            ${variantClasses[variant].item}
                            ${(currentPage === 1 || disabled) ? variantClasses[variant].disabled : ''}
                        `}
                        aria-label="First page"
                    >
                        {itemRender ? itemRender(1, 'jump-prev', <FiChevronsLeft className={sizeClasses[size].icon} />) : (
                            <FiChevronsLeft className={sizeClasses[size].icon} />
                        )}
                    </button>
                )}

                {/* Previous page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || disabled}
                        className={`
                            flex items-center justify-center rounded-lg
                            transition-all duration-200
                            ${sizeClasses[size].item}
                            ${variantClasses[variant].item}
                            ${(currentPage === 1 || disabled) ? variantClasses[variant].disabled : ''}
                        `}
                        aria-label="Previous page"
                    >
                        {itemRender ? itemRender(currentPage - 1, 'prev', <FiChevronLeft className={sizeClasses[size].icon} />) : (
                            <FiChevronLeft className={sizeClasses[size].icon} />
                        )}
                    </button>
                )}

                {/* Page numbers */}
                {showPageNumbers && getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`dots-${index}`}
                                className={`
                                    flex items-center justify-center rounded-lg
                                    text-slate-400 dark:text-slate-500
                                    ${sizeClasses[size].item}
                                `}
                            >
                                <FiMoreHorizontal className={sizeClasses[size].icon} />
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={disabled}
                            className={`
                                flex items-center justify-center rounded-lg font-medium
                                transition-all duration-200
                                ${sizeClasses[size].item}
                                ${variantClasses[variant].item}
                                ${isActive ? variantClasses[variant].active : ''}
                                ${disabled ? variantClasses[variant].disabled : ''}
                            `}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {itemRender ? itemRender(pageNum, 'page', pageNum) : pageNum}
                        </button>
                    );
                })}

                {/* Next page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || disabled}
                        className={`
                            flex items-center justify-center rounded-lg
                            transition-all duration-200
                            ${sizeClasses[size].item}
                            ${variantClasses[variant].item}
                            ${(currentPage === totalPages || disabled) ? variantClasses[variant].disabled : ''}
                        `}
                        aria-label="Next page"
                    >
                        {itemRender ? itemRender(currentPage + 1, 'next', <FiChevronRight className={sizeClasses[size].icon} />) : (
                            <FiChevronRight className={sizeClasses[size].icon} />
                        )}
                    </button>
                )}

                {/* Last page */}
                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || disabled}
                        className={`
                            flex items-center justify-center rounded-lg
                            transition-all duration-200
                            ${sizeClasses[size].item}
                            ${variantClasses[variant].item}
                            ${(currentPage === totalPages || disabled) ? variantClasses[variant].disabled : ''}
                        `}
                        aria-label="Last page"
                    >
                        {itemRender ? itemRender(totalPages, 'jump-next', <FiChevronsRight className={sizeClasses[size].icon} />) : (
                            <FiChevronsRight className={sizeClasses[size].icon} />
                        )}
                    </button>
                )}
            </nav>

            {/* Quick jumper */}
            {showQuickJumper && (
                <div className="relative">
                    <AnimatePresence>
                        {showJumpInput ? (
                            <motion.form
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 100, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                onSubmit={handleJump}
                                className="overflow-hidden"
                            >
                                <input
                                    type="number"
                                    value={jumpPage}
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    min={1}
                                    max={totalPages}
                                    placeholder={`1-${totalPages}`}
                                    className={`
                                        w-24 px-3 rounded-lg border border-slate-200 dark:border-slate-700
                                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                                        focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                                        transition-all duration-200
                                        ${sizeClasses[size].select}
                                    `}
                                    autoFocus
                                    onBlur={() => setShowJumpInput(false)}
                                />
                            </motion.form>
                        ) : (
                            <button
                                onClick={() => setShowJumpInput(true)}
                                className={`
                                    px-3 rounded-lg border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400
                                    hover:border-orange-500 hover:text-orange-500
                                    transition-all duration-200
                                    ${sizeClasses[size].select}
                                `}
                            >
                                Go to
                            </button>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Compact page indicator */}
            {!showPageNumbers && (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                </span>
            )}
        </div>
    );
};

export default Pagination;