import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import RevenueChart from '../charts/RevenueChart';
import OrdersChart from '../charts/OrdersChart';
import PopularItemsChart from '../charts/PopularItemsChart';
import adminOrderService from '../services/adminOrderService';
import './DashboardPage.css';

const StatCard = ({ title, value, icon, trend, color, trendType = 'up' }) => {
    const IconComponent = icon;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider text-[11px]">{title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                    {trend && (
                        <div className={`mt-3 flex items-center gap-1 text-[13px] font-bold ${trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${trendType === 'up' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                <FiTrendingUp className={`text-[10px] ${trendType === 'down' ? 'rotate-180' : ''}`} />
                            </div>
                            <span>{trend}%</span>
                            <span className="text-slate-400 font-medium text-xs ml-0.5">from last month</span>
                        </div>
                    )}
                </div>
                <div 
                    className="p-4 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                        backgroundColor: `${color}15`,
                        color: color,
                        boxShadow: `0 8px 16px -4px ${color}20`
                    }}
                >
                    <IconComponent className="text-2xl" />
                </div>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150 -z-10"></div>
        </div>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await adminOrderService.getDashboardStats();
                setStats(response.data);
                setRecentOrders(response.data?.recentOrders || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Building your insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time business performance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <span>Export Report</span>
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats?.overview?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                    icon={FiDollarSign}
                    trend={12.5}
                    color="#2563eb"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.overview?.totalOrders?.toLocaleString() || 0}
                    icon={FiShoppingBag}
                    trend={8.2}
                    color="#f59e0b"
                />
                <StatCard 
                    title="Active Customers" 
                    value="1,284" 
                    icon={FiUsers} 
                    trend={4.1}
                    color="#10b981" 
                />
                <StatCard
                    title="Growth Rate"
                    value={`${stats?.growthRate || '18'}%`}
                    icon={FiTrendingUp}
                    trend={5.4}
                    color="#8b5cf6"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Insights</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Weekly earnings trend</p>
                        </div>
                        <select className="bg-slate-50 border-none text-xs font-bold text-slate-600 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[350px]">
                        <RevenueChart data={stats?.salesData || []} />
                    </div>
                </div>
                
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-8">Order Distribution</h2>
                    <div className="h-[350px] flex items-center justify-center">
                        <OrdersChart data={stats?.ordersByStatus || []} />
                    </div>
                </div>
            </div>

            {/* Popular Items & Recent Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 lg:col-span-1">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-8">Top Selling Items</h2>
                    <PopularItemsChart data={stats?.topSellingFoods || []} />
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 lg:col-span-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recent Activity</h2>
                        <button className="text-blue-600 text-xs font-extrabold hover:underline">View All Orders</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Order ID</th>
                                    <th className="pb-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="pb-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.slice(0, 6).map((order) => (
                                    <tr key={order._id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">#{order.orderNumber}</span>
                                                <span className="text-xs text-slate-400 font-medium">{order.userDetails?.name || 'Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide
                                                ${order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                                  order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 
                                                  'bg-amber-100 text-amber-700'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                                                ${order.totalAmount?.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
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
