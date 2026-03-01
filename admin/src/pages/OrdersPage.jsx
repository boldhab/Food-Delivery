import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiRefreshCw,
    FiEye,
    FiPrinter,
    FiMail,
    FiMessageSquare,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiTruck,
    FiPackage,
    FiHome,
    FiDollarSign,
    FiCalendar,
    FiMoreVertical,
    FiSliders,
    FiChevronDown,
    FiChevronUp,
    FiAlertCircle,
    FiBarChart2,
    FiPieChart,
    FiTrendingUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAdminDataContext } from '../../contexts/AdminDataContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import adminOrderService from '../../services/adminOrderService';
import adminNotificationService from '../../services/adminNotificationService';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    estimatedDeliveryTime?: string;
    driver?: {
        _id: string;
        name: string;
    };
}

interface Filters {
    status: string;
    paymentStatus: string;
    search: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
    paymentMethod: string;
    driver: string;
}

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    ordersByStatus: Record<string, number>;
    revenueByDay: Array<{ date: string; revenue: number }>;
}

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        state,
        fetchOrders,
        updateOrder,
        isLoading,
        getError,
        setFilters,
        clearFilters,
        pagination,
        goToPage,
        setPageSize,
        bulkUpdateOrders,
        exportData
    } = useAdminDataContext();

    const [localFilters, setLocalFilters] = useState<Filters>({
        status: '',
        paymentStatus: '',
        search: '',
        dateRange: 'all',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        paymentMethod: '',
        driver: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Load orders on mount and filter changes
    useEffect(() => {
        loadOrders();
    }, [localFilters, pagination.currentPage, pagination.itemsPerPage]);

    // Load order statistics
    useEffect(() => {
        loadOrderStats();
    }, []);

    const loadOrders = async () => {
        const filters: any = {
            page: pagination.currentPage,
            limit: pagination.itemsPerPage
        };

        if (localFilters.status) filters.status = localFilters.status;
        if (localFilters.paymentStatus) filters.paymentStatus = localFilters.paymentStatus;
        if (localFilters.search) filters.search = localFilters.search;
        if (localFilters.paymentMethod) filters.paymentMethod = localFilters.paymentMethod;
        if (localFilters.driver) filters.driver = localFilters.driver;

        // Handle date range
        if (localFilters.dateRange !== 'custom') {
            const now = new Date();
            switch (localFilters.dateRange) {
                case 'today':
                    filters.startDate = format(now, 'yyyy-MM-dd');
                    filters.endDate = format(now, 'yyyy-MM-dd');
                    break;
                case 'yesterday':
                    const yesterday = subDays(now, 1);
                    filters.startDate = format(yesterday, 'yyyy-MM-dd');
                    filters.endDate = format(yesterday, 'yyyy-MM-dd');
                    break;
                case 'last7days':
                    filters.startDate = format(subDays(now, 7), 'yyyy-MM-dd');
                    filters.endDate = format(now, 'yyyy-MM-dd');
                    break;
                case 'last30days':
                    filters.startDate = format(subDays(now, 30), 'yyyy-MM-dd');
                    filters.endDate = format(now, 'yyyy-MM-dd');
                    break;
                case 'thisMonth':
                    filters.startDate = format(startOfMonth(now), 'yyyy-MM-dd');
                    filters.endDate = format(endOfMonth(now), 'yyyy-MM-dd');
                    break;
                case 'lastMonth':
                    const lastMonth = subDays(startOfMonth(now), 1);
                    filters.startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
                    filters.endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
                    break;
            }
        } else {
            if (localFilters.startDate) filters.startDate = localFilters.startDate;
            if (localFilters.endDate) filters.endDate = localFilters.endDate;
        }

        // Amount range
        if (localFilters.minAmount) filters.minAmount = localFilters.minAmount;
        if (localFilters.maxAmount) filters.maxAmount = localFilters.maxAmount;

        await fetchOrders(filters);
    };

    const loadOrderStats = async () => {
        try {
            const response = await adminOrderService.getOrderStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load order stats:', error);
        }
    };

    const handleRefresh = async () => {
        await loadOrders();
        await loadOrderStats();
        toast.success('Orders refreshed');
    };

    const handleViewOrder = (orderId: string) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handlePrintOrder = (order: Order) => {
        // Implement print functionality
        window.print();
    };

    const handleSendEmail = async (order: Order) => {
        try {
            await adminNotificationService.sendOrderEmail(order._id);
            toast.success('Email sent to customer');
        } catch (error) {
            toast.error('Failed to send email');
        }
    };

    const handleSendSMS = async (order: Order) => {
        try {
            await adminNotificationService.sendOrderSMS(order._id);
            toast.success('SMS sent to customer');
        } catch (error) {
            toast.error('Failed to send SMS');
        }
    };

    const handleBulkUpdate = async (updates: Partial<Order>) => {
        await bulkUpdateOrders(selectedOrders, updates);
        setSelectedOrders([]);
        setShowBulkActions(false);
        loadOrders();
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
            await bulkUpdateOrders(selectedOrders, { isDeleted: true });
            setSelectedOrders([]);
            setShowBulkActions(false);
            loadOrders();
        }
    };

    const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
        await exportData('orders', format);
    };

    const handleClearFilters = () => {
        setLocalFilters({
            status: '',
            paymentStatus: '',
            search: '',
            dateRange: 'all',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            paymentMethod: '',
            driver: ''
        });
        clearFilters();
        loadOrders();
    };

    // Status options
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'confirmed', label: 'Confirmed', color: 'blue' },
        { value: 'preparing', label: 'Preparing', color: 'orange' },
        { value: 'out_for_delivery', label: 'Out for Delivery', color: 'purple' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];

    const paymentStatusOptions = [
        { value: '', label: 'All Payment' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
    ];

    const paymentMethodOptions = [
        { value: '', label: 'All Methods' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'cash', label: 'Cash' }
    ];

    const dateRangeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' }
    ];

    // Table columns
    const columns = [
        {
            key: 'orderNumber',
            title: 'Order #',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono font-medium">#{value}</span>
            )
        },
        {
            key: 'customer',
            title: 'Customer',
            sortable: true,
            render: (_: any, record: Order) => (
                <div>
                    <div className="font-medium">{record.customer?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{record.customer?.email}</div>
                </div>
            )
        },
        {
            key: 'totalAmount',
            title: 'Amount',
            sortable: true,
            align: 'right' as const,
            render: (value: number) => (
                <span className="font-medium">${value?.toFixed(2)}</span>
            )
        },
        {
            key: 'orderStatus',
            title: 'Status',
            sortable: true,
            align: 'center' as const,
            render: (value: string) => (
                <StatusBadge status={value} type="order" variant="pill" showIcon />
            )
        },
        {
            key: 'paymentStatus',
            title: 'Payment',
            sortable: true,
            align: 'center' as const,
            render: (value: string) => (
                <StatusBadge status={value} type="payment" variant="dot" />
            )
        },
        {
            key: 'paymentMethod',
            title: 'Method',
            sortable: true,
            render: (value: string) => value?.replace('_', ' ') || 'N/A'
        },
        {
            key: 'createdAt',
            title: 'Date',
            sortable: true,
            render: (value: string) => (
                <div>
                    <div>{format(new Date(value), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-slate-500">{format(new Date(value), 'h:mm a')}</div>
                </div>
            )
        },
        {
            key: 'driver',
            title: 'Driver',
            render: (_: any, record: Order) => record.driver?.name || 'Unassigned'
        }
    ];

    // Filter Panel Component
    const FilterPanel = () => (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
        >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Order Status
                        </label>
                        <select
                            value={localFilters.status}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Status
                        </label>
                        <select
                            value={localFilters.paymentStatus}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {paymentStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Payment Method
                        </label>
                        <select
                            value={localFilters.paymentMethod}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {paymentMethodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Date Range
                        </label>
                        <select
                            value={localFilters.dateRange}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        >
                            {dateRangeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Date Range */}
                    {localFilters.dateRange === 'custom' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.startDate}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.endDate}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm"
                                />
                            </div>
                        </>
                    )}

                    {/* Amount Range */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Min Amount
                        </label>
                        <input
                            type="number"
                            value={localFilters.minAmount}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Max Amount
                        </label>
                        <input
                            type="number"
                            value={localFilters.maxAmount}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                            placeholder="1000"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
                        />
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {localFilters.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Status: {statusOptions.find(o => o.value === localFilters.status)?.label}
                                <button onClick={() => setLocalFilters(prev => ({ ...prev, status: '' }))}>×</button>
                            </span>
                        )}
                        {localFilters.paymentStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Payment: {paymentStatusOptions.find(o => o.value === localFilters.paymentStatus)?.label}
                                <button onClick={() => setLocalFilters(prev => ({ ...prev, paymentStatus: '' }))}>×</button>
                            </span>
                        )}
                        {localFilters.dateRange !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                {dateRangeOptions.find(o => o.value === localFilters.dateRange)?.label}
                                <button onClick={() => setLocalFilters(prev => ({ ...prev, dateRange: 'all' }))}>×</button>
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-orange-500 hover:text-orange-600"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Stats Cards
    const StatsCards = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.totalOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.totalRevenue?.toFixed(2) || '0'}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Avg Order Value</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats?.averageOrderValue?.toFixed(2) || '0'}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.pendingOrders || 0}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-yellow-600" />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // Bulk Actions Bar
    const BulkActionsBar = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                     bg-white dark:bg-slate-800 rounded-xl shadow-2xl
                     border border-slate-200 dark:border-slate-700
                     p-4 flex items-center gap-4"
        >
            <span className="text-sm font-medium">
                {selectedOrders.length} orders selected
            </span>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'confirmed' || value === 'preparing' || 
                        value === 'out_for_delivery' || value === 'delivered') {
                        handleBulkUpdate({ orderStatus: value });
                    } else if (value === 'delete') {
                        handleBulkDelete();
                    }
                    e.target.value = '';
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
                         border border-transparent rounded-lg text-sm
                         focus:outline-none focus:border-orange-500"
            >
                <option value="">Bulk Actions</option>
                <optgroup label="Update Status">
                    <option value="confirmed">Mark as Confirmed</option>
                    <option value="preparing">Mark as Preparing</option>
                    <option value="out_for_delivery">Mark as Out for Delivery</option>
                    <option value="delivered">Mark as Delivered</option>
                </optgroup>
                <option value="delete" className="text-red-500">Delete Selected</option>
            </select>

            <button
                onClick={() => setSelectedOrders([])}
                className="text-slate-400 hover:text-slate-600"
            >
                Cancel
            </button>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Orders
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Track, manage, and update customer orders
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm'
                                    : 'text-slate-500 hover:text-orange-500'
                            }`}
                            title="Table View"
                        >
                            <FiPackage className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm'
                                    : 'text-slate-500 hover:text-orange-500'
                            }`}
                            title="Grid View"
                        >
                            <FiBarChart2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stats Toggle */}
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`p-2 rounded-lg transition-colors ${
                            showStats
                                ? 'bg-orange-500 text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-orange-500'
                        }`}
                        title="Toggle Statistics"
                    >
                        <FiPieChart className="w-4 h-4" />
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="px-4 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     hover:border-orange-500 transition-colors
                                     flex items-center gap-2"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <AnimatePresence>
                            {showBulkActions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                             overflow-hidden z-10"
                                >
                                    {(['csv', 'excel', 'pdf'] as const).map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => {
                                                handleExport(format);
                                                setShowBulkActions(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2"
                                        >
                                            <FiDownload className="w-4 h-4" />
                                            <span className="capitalize">Export as {format.toUpperCase()}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading('orders')}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-xl transition-colors
                                 flex items-center gap-2 shadow-lg shadow-orange-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${isLoading('orders') ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </motion.div>

            {/* Stats Section */}
            <AnimatePresence>
                {showStats && stats && <StatsCards />}
            </AnimatePresence>

            {/* Search and Filters */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={localFilters.search}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search by order #, customer name, email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm
                                     focus:outline-none focus:border-orange-500
                                     focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg border transition-colors
                                 flex items-center gap-2
                                 ${showFilters
                                     ? 'bg-orange-500 text-white border-orange-500'
                                     : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500'
                                 }`}
                    >
                        <FiSliders className="w-4 h-4" />
                        <span>Filters</span>
                        {Object.values(localFilters).filter(v => v && v !== 'all' && v !== '').length > 0 && (
                            <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                                {Object.values(localFilters).filter(v => v && v !== 'all' && v !== '').length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && <FilterPanel />}
                </AnimatePresence>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
                {getError('orders') && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20
                                 border border-red-200 dark:border-red-800
                                 rounded-xl flex items-center gap-3"
                    >
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                            {getError('orders')}
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="ml-auto text-sm text-red-600 hover:text-red-700"
                        >
                            Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Orders Table */}
            <motion.div variants={itemVariants}>
                <DataTable
                    columns={columns}
                    data={state.orders}
                    loading={isLoading('orders')}
                    onRowClick={(record) => handleViewOrder(record._id)}
                    onSelectionChange={(selected) => setSelectedOrders(selected)}
                    selectable
                    rowKey="_id"
                    currentPage={pagination.currentPage}
                    pageSize={pagination.itemsPerPage}
                    totalItems={pagination.totalItems}
                    onPageChange={goToPage}
                    onPageSizeChange={setPageSize}
                    showSizeChanger
                    pageSizeOptions={[10, 25, 50, 100]}
                    striped
                    hoverable
                    actions={(record) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOrder(record._id);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-500
                                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                                         rounded transition-colors"
                                title="View Order"
                            >
                                <FiEye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintOrder(record);
                                }}
                                className="p-1.5 text-slate-500 hover:text-purple-500
                                         hover:bg-purple-50 dark:hover:bg-purple-900/20
                                         rounded transition-colors"
                                title="Print Order"
                            >
                                <FiPrinter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendEmail(record);
                                }}
                                className="p-1.5 text-slate-500 hover:text-green-500
                                         hover:bg-green-50 dark:hover:bg-green-900/20
                                         rounded transition-colors"
                                title="Send Email"
                            >
                                <FiMail className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendSMS(record);
                                }}
                                className="p-1.5 text-slate-500 hover:text-orange-500
                                         hover:bg-orange-50 dark:hover:bg-orange-900/20
                                         rounded transition-colors"
                                title="Send SMS"
                            >
                                <FiMessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
            </motion.div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedOrders.length > 0 && <BulkActionsBar />}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrdersPage;