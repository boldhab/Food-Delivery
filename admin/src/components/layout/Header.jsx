import React, { useState } from 'react';
import { FiMenu, FiBell, FiUser, FiChevronDown } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAdminAuth();
    const [open, setOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-[var(--surface)]/80 backdrop-blur-md border-b border-slate-200"
        >
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 transition-colors rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                    type="button"
                >
                    <FiMenu className="text-xl" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-[var(--text-primary)]">
                        Admin Overview
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Welcome back, <span className="text-[var(--primary)] font-semibold">{user?.name || 'Admin'}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="relative p-2 transition-colors rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
                    type="button"
                    aria-label="Notifications"
                >
                    <FiBell className="text-xl" />
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-[var(--danger)] text-[10px] font-bold text-white rounded-full border-2 border-white ring-1 ring-red-500/20">
                        3
                    </span>
                </button>

                <div className="h-8 w-px bg-slate-200 mx-1"></div>

                <div className="relative">
                    <button
                        onClick={() => setOpen((prev) => !prev)}
                        className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                        type="button"
                    >
                        <div className="flex flex-col items-end hidden md:flex">
                            <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                                {user?.name || 'Admin'}
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                                Administrator
                            </span>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-lg shadow-blue-200 ring-2 ring-white">
                            <FiUser className="text-lg" />
                        </div>
                        <FiChevronDown className="text-sm text-[var(--text-secondary)]" />
                    </button>

                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg p-2 z-30"
                            >
                                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-slate-50">
                                    Profile
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-slate-50">
                                    Settings
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--danger)] hover:bg-red-50"
                                >
                                    Sign out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
