import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();

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
    };

    return (
        <aside 
            className={`flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-30 shadow-sm
            ${collapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            FoodieHub
                        </span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">
                        F
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${isActive 
                                ? 'bg-blue-50 text-blue-600 font-semibold' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <item.icon className={`text-xl ${collapsed ? '' : 'min-w-[20px]'}`} />
                        {!collapsed && <span className="text-sm tracking-wide">{item.label}</span>}
                        {collapsed && (
                            <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleLogout}
                    className={`
                        flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <FiLogOut className="text-xl" />
                    {!collapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
                    {collapsed && (
                        <div className="fixed left-20 ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Logout
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
