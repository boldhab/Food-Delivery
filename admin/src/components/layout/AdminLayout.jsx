import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FiMenu,
    FiX,
    FiBell,
    FiUser,
    FiLogOut,
    FiSettings,
    FiHelpCircle,
    FiSearch,
    FiMaximize2,
    FiMinimize2,
    FiMoon,
    FiSun,
    FiChevronDown
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';

interface AdminLayoutProps {
    children?: React.ReactNode;
    title?: string;
    showHeader?: boolean;
    showFooter?: boolean;
    fullWidth?: boolean;
    className?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title,
    showHeader = true,
    showFooter = true,
    fullWidth = false,
    className = ''
}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    // Save sidebar state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    // Handle theme
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    // Get page title based on location
    const getPageTitle = () => {
        if (title) return title;

        const path = location.pathname;
        if (path.includes('/admin/dashboard')) return 'Dashboard';
        if (path.includes('/admin/orders')) return 'Orders';
        if (path.includes('/admin/menu')) return 'Menu Management';
        if (path.includes('/admin/users')) return 'Users';
        if (path.includes('/admin/reports')) return 'Reports';
        if (path.includes('/admin/settings')) return 'Settings';
        
        return 'Admin Dashboard';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Header */}
                {showHeader && (
                    <header className={`
                        sticky top-0 z-10 transition-all duration-300
                        ${isScrolled 
                            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg' 
                            : 'bg-white dark:bg-slate-900'
                        }
                        border-b border-slate-200 dark:border-slate-800
                    `}>
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                {/* Left Section */}
                                <div className="flex items-center gap-4">
                                    {/* Mobile Menu Button */}
                                    <button
                                        onClick={() => setMobileOpen(true)}
                                        className="md:hidden p-2 rounded-lg text-slate-500
                                                 hover:text-orange-500 hover:bg-slate-100
                                                 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <FiMenu className="w-5 h-5" />
                                    </button>

                                    {/* Page Title */}
                                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {getPageTitle()}
                                    </h1>

                                    {/* Breadcrumbs */}
                                    <nav className="hidden md:flex items-center gap-2 text-sm">
                                        <span className="text-slate-400">/</span>
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {location.pathname.split('/').pop()}
                                        </span>
                                    </nav>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <form onSubmit={handleSearch} className="hidden md:block">
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search..."
                                                className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800
                                                         border border-transparent rounded-lg
                                                         text-sm text-slate-900 dark:text-white
                                                         placeholder:text-slate-400
                                                         focus:outline-none focus:border-orange-500
                                                         focus:ring-2 focus:ring-orange-500/20
                                                         transition-all duration-200"
                                            />
                                        </div>
                                    </form>

                                    {/* Fullscreen Toggle */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                                 transition-colors hidden lg:block"
                                    >
                                        {isFullscreen ? (
                                            <FiMinimize2 className="w-5 h-5" />
                                        ) : (
                                            <FiMaximize2 className="w-5 h-5" />
                                        )}
                                    </button>

                                    {/* Theme Toggle */}
                                    <button
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                                 transition-colors"
                                    >
                                        {isDarkMode ? (
                                            <FiSun className="w-5 h-5" />
                                        ) : (
                                            <FiMoon className="w-5 h-5" />
                                        )}
                                    </button>

                                    {/* Notifications */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className="relative p-2 rounded-lg text-slate-500
                                                     hover:text-orange-500 hover:bg-slate-100
                                                     dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <FiBell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 w-4 h-4
                                                               bg-orange-500 text-white text-xs
                                                               rounded-full flex items-center justify-center
                                                               animate-pulse">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Notifications Dropdown */}
                                        <AnimatePresence>
                                            {showNotifications && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 mt-2 w-80 bg-white
                                                             dark:bg-slate-800 rounded-xl shadow-xl
                                                             border border-slate-200 dark:border-slate-700
                                                             overflow-hidden z-50"
                                                >
                                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                                Notifications
                                                            </h3>
                                                            {unreadCount > 0 && (
                                                                <button
                                                                    onClick={markAllAsRead}
                                                                    className="text-xs text-orange-500
                                                                             hover:text-orange-600"
                                                                >
                                                                    Mark all as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="max-h-96 overflow-y-auto">
                                                        {notifications.length === 0 ? (
                                                            <div className="p-8 text-center">
                                                                <FiBell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                                                <p className="text-sm text-slate-500">
                                                                    No notifications
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            notifications.map((notification) => (
                                                                <div
                                                                    key={notification.id}
                                                                    onClick={() => {
                                                                        markAsRead(notification.id);
                                                                        setShowNotifications(false);
                                                                        navigate(notification.link);
                                                                    }}
                                                                    className={`
                                                                        p-4 border-b last:border-b-0
                                                                        border-slate-100 dark:border-slate-700
                                                                        cursor-pointer transition-colors
                                                                        ${notification.read
                                                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                                                            : 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                                        }
                                                                    `}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`
                                                                            w-8 h-8 rounded-full flex items-center
                                                                            justify-center flex-shrink-0
                                                                            ${notification.type === 'success' && 'bg-green-100 text-green-600'}
                                                                            ${notification.type === 'warning' && 'bg-yellow-100 text-yellow-600'}
                                                                            ${notification.type === 'error' && 'bg-red-100 text-red-600'}
                                                                            ${notification.type === 'info' && 'bg-blue-100 text-blue-600'}
                                                                        `}>
                                                                            {notification.icon}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                                {notification.title}
                                                                            </p>
                                                                            <p className="text-xs text-slate-500 mt-1">
                                                                                {notification.message}
                                                                            </p>
                                                                            <p className="text-xs text-slate-400 mt-1">
                                                                                {notification.time}
                                                                            </p>
                                                                        </div>
                                                                        {!notification.read && (
                                                                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                                        <button
                                                            onClick={() => {
                                                                setShowNotifications(false);
                                                                navigate('/admin/notifications');
                                                            }}
                                                            className="w-full px-3 py-2 text-center
                                                                     text-sm text-orange-500 hover:text-orange-600
                                                                     hover:bg-slate-50 dark:hover:bg-slate-700
                                                                     rounded-lg transition-colors"
                                                        >
                                                            View all notifications
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* User Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 pl-2 pr-1 py-1
                                                     rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
                                                     transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500
                                                          rounded-full flex items-center justify-center
                                                          text-white font-semibold text-sm">
                                                {user?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {user?.name || 'Admin User'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {user?.role || 'Administrator'}
                                                </div>
                                            </div>
                                            <FiChevronDown className="w-4 h-4 text-slate-400" />
                                        </button>

                                        {/* User Dropdown */}
                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white
                                                             dark:bg-slate-800 rounded-xl shadow-xl
                                                             border border-slate-200 dark:border-slate-700
                                                             overflow-hidden z-50"
                                                >
                                                    <div className="p-2">
                                                        <button
                                                            onClick={() => {
                                                                setShowUserMenu(false);
                                                                navigate('/admin/profile');
                                                            }}
                                                            className="w-full px-3 py-2 text-left rounded-lg
                                                                     text-slate-700 dark:text-slate-300
                                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                                     flex items-center gap-2 transition-colors"
                                                        >
                                                            <FiUser className="w-4 h-4" />
                                                            Profile
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowUserMenu(false);
                                                                navigate('/admin/settings');
                                                            }}
                                                            className="w-full px-3 py-2 text-left rounded-lg
                                                                     text-slate-700 dark:text-slate-300
                                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                                     flex items-center gap-2 transition-colors"
                                                        >
                                                            <FiSettings className="w-4 h-4" />
                                                            Settings
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowUserMenu(false);
                                                                navigate('/admin/help');
                                                            }}
                                                            className="w-full px-3 py-2 text-left rounded-lg
                                                                     text-slate-700 dark:text-slate-300
                                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                                     flex items-center gap-2 transition-colors"
                                                        >
                                                            <FiHelpCircle className="w-4 h-4" />
                                                            Help & Support
                                                        </button>
                                                        <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full px-3 py-2 text-left rounded-lg
                                                                     text-red-600 dark:text-red-400
                                                                     hover:bg-red-50 dark:hover:bg-red-900/20
                                                                     flex items-center gap-2 transition-colors"
                                                        >
                                                            <FiLogOut className="w-4 h-4" />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content Area */}
                <main className={`
                    flex-1 px-4 py-6 sm:px-6 lg:px-8
                    ${fullWidth ? '' : 'max-w-7xl mx-auto w-full'}
                    ${className}
                `}>
                    {/* Page Transitions */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {children || <Outlet />}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer */}
                {showFooter && <Footer variant="admin" />}
            </div>
        </div>
    );
};

export default AdminLayout;