import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import adminOrderService from '../services/adminOrderService';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [pagination.currentPage, pagination.pageSize, filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.pageSize,
                status: filters.status || undefined,
                search: filters.search || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined
            };

            const response = await adminOrderService.getOrders(params);
            setOrders(response.data.orders || []);
            setPagination((prev) => ({
                ...prev,
                totalItems: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.pages || 1
            }));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handleStatusFilter = (status) => {
        setFilters((prev) => ({ ...prev, status }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const handleSearch = (query) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const columns = [
        {
            key: 'orderNumber',
            title: 'Order #',
            render: (_, order) => (
                <span className="order-link" onClick={() => handleViewOrder(order._id)}>
                    {order.orderNumber}
                </span>
            )
        },
        {
            key: 'customer',
            title: 'Customer',
            render: (_, order) => order.userDetails?.name || 'N/A'
        },
        {
            key: 'totalAmount',
            title: 'Amount',
            render: (amount) => `$${amount?.toFixed(2)}`,
            sortable: true
        },
        {
            key: 'orderStatus',
            title: 'Status',
            render: (status) => <StatusBadge status={status} type="order" />
        },
        {
            key: 'paymentStatus',
            title: 'Payment',
            render: (status) => <StatusBadge status={status} type="payment" />
        },
        {
            key: 'createdAt',
            title: 'Date',
            render: (date) => new Date(date).toLocaleDateString(),
            sortable: true
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, order) => (
                <button className="view-btn" onClick={() => handleViewOrder(order._id)}>
                    View Details
                </button>
            )
        }
    ];

    const statusFilters = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Track and manage customer orders efficiently.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <span>Export CSV</span>
                    </button>
                    <button onClick={fetchOrders} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        Refresh Orders
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                    <SearchBar onSearch={handleSearch} placeholder="Search by order ID or customer..." />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={filters.status} 
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="bg-slate-50 border-slate-100 text-sm font-bold text-slate-600 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                        {statusFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label} Orders
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">From</span>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">To</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={orders}
                    loading={loading}
                    onSort={(key) => console.log('Sort by:', key)}
                    onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    variant="professional"
                />
            </div>
        </div>
    );
};

export default OrdersPage;
