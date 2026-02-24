import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import RevenueChart from '../charts/RevenueChart';
import OrdersChart from '../charts/OrdersChart';
import PopularItemsChart from '../charts/PopularItemsChart';
import adminOrderService from '../services/adminOrderService';

const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' }
    })
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await adminOrderService.getDashboardStats();
                const payload = response?.data || response;
                const data = payload?.data || payload;
                setStats(data);
                setRecentOrders(data?.recentOrders || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const cards = useMemo(() => ([
        {
            title: 'Total Revenue',
            value: `$${stats?.overview?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            icon: FiDollarSign,
            trend: 12.5,
            color: 'var(--primary)'
        },
        {
            title: 'Total Orders',
            value: stats?.overview?.totalOrders?.toLocaleString() || '0',
            icon: FiShoppingBag,
            trend: 8.2,
            color: '#F5A623'
        },
        {
            title: 'Active Users',
            value: stats?.overview?.completedOrders?.toLocaleString() || '0',
            icon: FiUsers,
            trend: 4.1,
            color: 'var(--secondary)'
        },
        {
            title: 'Growth Rate',
            value: `${stats?.growthRate || '18'}%`,
            icon: FiTrendingUp,
            trend: 5.4,
            color: '#7C5CFC'
        }
    ]), [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
                    <p className="text-[var(--text-secondary)] font-semibold">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Admin Dashboard</h1>
                    <p className="text-[var(--text-secondary)] mt-1 font-medium">Business overview, sales performance, and live trends.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-md bg-white border border-slate-200 text-[var(--text-primary)] font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all">
                        Export Report
                    </button>
                    <button className="px-4 py-2.5 rounded-md bg-primary text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:bg-primary/90 transition-all">
                        Refresh Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="rounded-2xl bg-[var(--surface)] p-6 shadow-sm border border-slate-100"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{card.title}</p>
                                <h3 className="text-3xl font-bold text-[var(--text-primary)] mt-2">{card.value}</h3>
                                <div className="mt-3 text-xs text-[var(--text-secondary)]">Trend +{card.trend}%</div>
                            </div>
                            <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${card.color}22`, color: card.color }}
                            >
                                <card.icon className="text-2xl" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl bg-[var(--surface)] p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Revenue Insights</h2>
                            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Weekly performance</p>
                        </div>
                        <select className="bg-slate-50 border-none text-xs font-semibold text-[var(--text-secondary)] px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[320px]">
                        <RevenueChart data={stats?.salesData || []} />
                    </div>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Order Distribution</h2>
                    <div className="h-[320px] flex items-center justify-center">
                        <OrdersChart data={stats?.ordersByStatus || []} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Top Selling Items</h2>
                    <PopularItemsChart data={stats?.topSellingFoods || []} />
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Orders</h2>
                        <button className="text-primary text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Order ID</th>
                                    <th className="pb-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center">Status</th>
                                    <th className="pb-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.slice(0, 6).map((order) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="group hover:bg-slate-50"
                                    >
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--text-primary)]">#{order.orderNumber}</span>
                                                <span className="text-xs text-[var(--text-secondary)] font-medium">{order.userDetails?.name || 'Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[rgba(74,144,226,0.15)] text-[var(--primary)]">
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                ${order.totalAmount?.toFixed(2)}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
