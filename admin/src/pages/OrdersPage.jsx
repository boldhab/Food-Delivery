import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import adminOrderService from '../services/adminOrderService';

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
            const payload = response?.data || response;
            const data = payload?.data || payload;
            setOrders(data?.orders || []);
            setPagination((prev) => ({
                ...prev,
                totalItems: data?.pagination?.total || 0,
                totalPages: data?.pagination?.pages || 1
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Track and manage customer orders.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                >
                    Refresh Orders
                </button>
            </div>

            <div className="rounded-2xl bg-[var(--surface)] border border-slate-100 shadow-sm p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="relative w-full lg:w-80">
                        <FiSearch className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                        <input
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            placeholder="Search orders..."
                            className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            {statusFilters.map((filter) => (
                                <option key={filter.value} value={filter.value}>{filter.label} Orders</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                                <th className="pb-3">Order</th>
                                <th className="pb-3">Customer</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Payment</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-[var(--text-secondary)]">Loading...</td>
                                </tr>
                            )}
                            {!loading && orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-[var(--text-secondary)]">No orders found.</td>
                                </tr>
                            )}
                            <AnimatePresence>
                                {orders.map((order, index) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.005 }}
                                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                                    >
                                        <td className="py-4 font-semibold text-[var(--text-primary)]">#{order.orderNumber}</td>
                                        <td className="py-4 text-[var(--text-secondary)]">{order.userDetails?.name || 'N/A'}</td>
                                        <td className="py-4 text-[var(--text-secondary)]">${order.totalAmount?.toFixed(2)}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-secondary/20 text-secondary">
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => handleViewOrder(order._id)}
                                                className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-semibold"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-6 text-sm text-[var(--text-secondary)]">
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1.5 rounded-md border border-slate-200"
                            disabled={pagination.currentPage === 1}
                            onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        >
                            Prev
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-md border border-slate-200"
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
