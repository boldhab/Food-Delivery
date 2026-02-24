import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiPieChart
} from 'react-icons/fi';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    const menuItems = [
        { path: '/admin', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
        { path: '/admin/foods', icon: FiPackage, label: 'Food Items' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
        { path: '/admin/reports', icon: FiPieChart, label: 'Reports' },
        { path: '/admin/settings', icon: FiSettings, label: 'Settings' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
        setMobileOpen(false);
    };

    return (
        <motion.aside
            initial={false}
            animate={{
                width: collapsed ? 84 : 260,
                x: isDesktop ? 0 : (mobileOpen ? 0 : -280)
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed md:relative z-30 flex h-screen flex-col border-r border-slate-200 bg-[var(--surface)] shadow-sm"
        >
            <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                        F
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                            FoodieHub
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 transition-colors"
                    aria-label="Toggle sidebar"
                    type="button"
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                            if (!isDesktop) setMobileOpen(false);
                        }}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                                isActive
                                    ? 'bg-[rgba(74,144,226,0.12)] text-[var(--primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)]'
                            } ${collapsed ? 'justify-center' : ''}`
                        }
                    >
                        <item.icon className="text-lg" />
                        {!collapsed && <span>{item.label}</span>}
                        {collapsed && (
                            <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-red-50 hover:text-[var(--danger)] transition-all ${
                        collapsed ? 'justify-center' : ''
                    }`}
                >
                    <FiLogOut className="text-lg" />
                    {!collapsed && <span className="text-sm font-semibold">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
