import React from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import './Header.css';

const Header = ({ toggleSidebar, isSidebarCollapsed }) => {
    const { user } = useAdminAuth();

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    className="p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" 
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <FiMenu className="text-xl" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-slate-800">
                        Overview
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Welcome back, <span className="text-blue-600 font-semibold">{user?.name || 'Admin'}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    className="relative p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" 
                    type="button" 
                    aria-label="Notifications"
                >
                    <FiBell className="text-xl" />
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full border-2 border-white ring-1 ring-red-500/20">
                        3
                    </span>
                </button>

                <div className="h-8 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                            {user?.name || 'Admin'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                            Administrator
                        </span>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                        <FiUser className="text-lg" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
