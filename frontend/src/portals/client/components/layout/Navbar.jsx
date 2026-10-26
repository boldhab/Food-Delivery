import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiShoppingCart, 
    FiHome, 
    FiMenu, 
    FiX, 
    FiUser, 
    FiLogOut, 
    FiLogIn, 
    FiUserPlus,
    FiBell,
    FiChevronDown,
    FiSearch,
    FiMoon,
    FiSun,
    FiCheckCircle,
    FiInfo,
    FiHeart,
    FiMaximize2,
    FiMinimize2
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useFavorites from '../../hooks/useFavorites';
import { useTheme } from '../../context/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import notificationService from '../../services/notification.service';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const { cart, openCart } = useCart();
    const { favoritesCount } = useFavorites();
    const { isDark, toggleTheme } = useTheme();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
    }, [location]);

    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            return;
        }

        const loadNotifications = async () => {
            try {
                const response = await notificationService.getNotifications({ limit: 20 });
                const items = response?.data?.notifications || [];
                setNotifications(items);
            } catch (error) {
                setNotifications([]);
            }
        };

        loadNotifications();
        const intervalId = window.setInterval(loadNotifications, 30000);
        return () => window.clearInterval(intervalId);
    }, [isAuthenticated]);

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        try {
            await logout();
        } catch {
            // continue navigation even if error occurs
        }
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/menu?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    const cartItemCount = cart?.totalItems || 0;
    const unreadCount = useMemo(
        () => notifications.filter((item) => !item?.read).length,
        [notifications]
    );

    const markNotificationAsRead = async (notification) => {
        if (!notification?._id) return;
        setNotifications((prev) =>
            prev.map((item) =>
                item._id === notification._id ? { ...item, read: true } : item
            )
        );
        try {
            await notificationService.markAsRead(notification._id);
        } catch (error) {
            // Best effort; list refresh will self-heal
        }
        if (notification?.link) {
            navigate(notification.link);
        }
        setIsNotificationsOpen(false);
    };

    const markAllNotificationsAsRead = async () => {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            // Best effort; list refresh will self-heal
        }
    };

    return (
        <>
            <nav 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
                           ${isScrolled 
                               ? 'bg-[var(--card)]/90 backdrop-blur-md elevation-2 border-b border-[var(--border)]' 
                               : 'bg-[var(--card)] border-b border-[var(--border)]'
                           }`}
            >
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo/Brand */}
                        <Link 
                            to="/" 
                            className="flex items-center gap-2.5 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <img 
                                src="/LOGO.png" 
                                alt="Food Hub Logo" 
                                className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-amber-500 
                                         bg-clip-text text-transparent">
                                Food Hub
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            <NavLink 
                                to="/" 
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-xl text-sm font-semibold
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-xs' 
                                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <FiHome className="w-4 h-4" />
                                    Home
                                </span>
                            </NavLink>
                            
                            <NavLink 
                                to="/menu" 
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-xl text-sm font-semibold
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-xs' 
                                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                    }
                                `}
                            >
                                Menu
                            </NavLink>
                            
                            <NavLink 
                                to="/about" 
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-xl text-sm font-semibold
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-xs' 
                                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                    }
                                `}
                            >
                                About Us
                            </NavLink>
                            
                            {isAuthenticated && (
                                <NavLink 
                                    to="/favorites" 
                                    className={({ isActive }) => `
                                        px-3.5 py-2 rounded-xl text-sm font-semibold
                                        transition-all duration-200 flex items-center gap-1.5
                                        ${isActive 
                                            ? 'text-rose-500 bg-rose-500/10 shadow-xs' 
                                            : 'text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-[var(--background)]'
                                        }
                                    `}
                                >
                                    <FiHeart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                                    <span>Favorites</span>
                                    {favoritesCount > 0 && (
                                        <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                            {favoritesCount}
                                        </span>
                                    )}
                                </NavLink>
                            )}
                            
                            {isAuthenticated && (
                                <NavLink 
                                    to="/orders" 
                                    className={({ isActive }) => `
                                        px-4 py-2 rounded-xl text-sm font-semibold
                                        transition-all duration-200
                                        ${isActive 
                                            ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-xs' 
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                        }
                                    `}
                                >
                                    Orders
                                </NavLink>
                            )}
                        </div>

                        {/* Desktop Right Section */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Theme Switcher */}
                            <ThemeSwitcher variant="dropdown" align="end" />

                            {/* Fullscreen Toggle */}
                            <button
                                onClick={toggleFullscreen}
                                type="button"
                                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--background)] transition-all duration-200 cursor-pointer"
                                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                            </button>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="relative mr-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search food..."
                                    className="w-64 pl-10 pr-4 py-2 bg-[var(--background)]
                                             border border-[var(--border)] focus:border-[var(--primary)]
                                             rounded-xl text-sm
                                             text-[var(--foreground)]
                                             placeholder:text-[var(--muted-foreground)]/60
                                             focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20
                                             transition-all duration-200"
                                />
                                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-[var(--muted-foreground)]" />
                            </form>

                            {/* Cart Drawer Trigger */}
                            <button 
                                onClick={openCart}
                                type="button"
                                className="relative p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--background)] transition-all duration-200 cursor-pointer"
                                aria-label="Open shopping cart"
                                title="View cart"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 
                                                 bg-[var(--primary)] text-white text-[10px] font-bold
                                                 rounded-full flex items-center justify-center
                                                 shadow-md shadow-[var(--primary)]/25"
                                    >
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </motion.span>
                                )}
                            </button>

                            {/* Notifications (if authenticated) */}
                            {isAuthenticated && (
                                <div className="relative">
                                    <button
                                        onClick={async () => {
                                            const nextOpen = !isNotificationsOpen;
                                            setIsNotificationsOpen(nextOpen);
                                            if (nextOpen) {
                                                try {
                                                    const response = await notificationService.getNotifications({ limit: 20 });
                                                    setNotifications(response?.data?.notifications || []);
                                                } catch (error) {
                                                    // ignore
                                                }
                                            }
                                        }}
                                        className="p-2 rounded-xl text-[var(--muted-foreground)] 
                                                 hover:text-[var(--primary)] hover:bg-[var(--background)] 
                                                 transition-all duration-200
                                                 relative cursor-pointer"
                                    >
                                        <FiBell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                                                           px-1 bg-[var(--primary)] text-white text-[10px] font-bold
                                                           rounded-full flex items-center justify-center">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isNotificationsOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className="absolute right-0 mt-2 w-80 bg-[var(--popover)]
                                                         rounded-2xl elevation-3 border border-[var(--border)]
                                                         overflow-hidden z-50 text-[var(--foreground)]"
                                            >
                                                <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
                                                    <p className="text-sm font-bold text-[var(--foreground)]">
                                                        Notifications
                                                    </p>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllNotificationsAsRead}
                                                            className="text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                                                        >
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                                                            No notifications
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification) => (
                                                            <button
                                                                key={notification._id}
                                                                onClick={() => markNotificationAsRead(notification)}
                                                                className={`w-full text-left px-4 py-3 border-b last:border-b-0
                                                                          border-[var(--border)] hover:bg-[var(--background)] cursor-pointer
                                                                          ${notification.read ? '' : 'bg-[var(--primary)]/10'}`}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <span className="mt-0.5 text-[var(--primary)]">
                                                                        {notification.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> : <FiInfo className="w-4 h-4" />}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-[var(--foreground)]">
                                                                            {notification.title}
                                                                        </p>
                                                                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        <p className="text-[11px] text-[var(--muted-foreground)]/70 mt-1">
                                                                            {notification.createdAt
                                                                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                                                                : 'just now'}
                                                                        </p>
                                                                    </div>
                                                                    {!notification.read && (
                                                                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Portal Switcher Button */}
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 text-xs font-bold hover:bg-[var(--primary)]/20 transition-all"
                                >
                                    <span>👑</span>
                                    <span>Admin Panel</span>
                                </Link>
                            )}
                            {user?.role === 'driver' && (
                                <Link
                                    to="/driver/available"
                                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                                >
                                    <span>🛵</span>
                                    <span>Driver Portal</span>
                                </Link>
                            )}

                            {/* Profile / Auth */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 pl-3 pr-2 py-1.5 
                                                 rounded-xl hover:bg-[var(--background)]
                                                 transition-all duration-200 cursor-pointer
                                                 text-[var(--foreground)] border border-transparent hover:border-[var(--border)]"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] 
                                                      rounded-xl flex items-center justify-center
                                                      text-white font-bold text-xs
                                                      shadow-sm">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-sm font-semibold max-w-[100px] truncate">
                                            {user?.name?.split(' ')[0] || 'Profile'}
                                        </span>
                                        <FiChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200
                                                                 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Profile Dropdown */}
                                    <AnimatePresence>
                                        {isProfileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-48 bg-[var(--popover)]
                                                         rounded-2xl elevation-3 border border-[var(--border)] 
                                                         overflow-hidden text-[var(--foreground)]"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-3
                                                             hover:bg-[var(--background)]
                                                             text-[var(--foreground)]
                                                             transition-colors duration-150"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <FiUser className="w-4 h-4 text-[var(--muted-foreground)]" />
                                                    <span className="text-sm font-medium">Profile</span>
                                                </Link>
                                                {user?.role === 'admin' && (
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center gap-3 px-4 py-3
                                                                 hover:bg-[var(--background)]
                                                                 text-[var(--primary)] font-semibold
                                                                 transition-colors duration-150 border-t border-[var(--border)]"
                                                        onClick={() => setIsProfileMenuOpen(false)}
                                                    >
                                                        <span>👑</span>
                                                        <span className="text-sm">Admin Dashboard</span>
                                                    </Link>
                                                )}
                                                {user?.role === 'driver' && (
                                                    <Link
                                                        to="/driver/available"
                                                        className="flex items-center gap-3 px-4 py-3
                                                                 hover:bg-[var(--background)]
                                                                 text-emerald-600 dark:text-emerald-400 font-semibold
                                                                 transition-colors duration-150 border-t border-[var(--border)]"
                                                        onClick={() => setIsProfileMenuOpen(false)}
                                                    >
                                                        <span>🛵</span>
                                                        <span className="text-sm">Driver Portal</span>
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3
                                                             hover:bg-rose-500/10
                                                             text-rose-500
                                                             transition-colors duration-150 cursor-pointer
                                                             border-t border-[var(--border)] font-semibold"
                                                >
                                                    <FiLogOut className="w-4 h-4" />
                                                    <span className="text-sm">Logout</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 
                                                 dark:text-slate-300 hover:text-green-500
                                                 transition-colors duration-200 cursor-pointer"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600
                                                 text-white text-sm font-medium rounded-lg
                                                 transition-colors duration-200
                                                 shadow-lg shadow-green-500/25 cursor-pointer"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300
                                     hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <FiX className="w-6 h-6" />
                            ) : (
                                <FiMenu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden bg-[var(--card)]
                                     border-t border-[var(--border)] text-[var(--foreground)]"
                        >
                            <div className="w-full px-4 py-4 space-y-4">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search food..."
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)]
                                                 border border-[var(--border)] focus:border-[var(--primary)]
                                                 rounded-xl text-sm
                                                 text-[var(--foreground)]
                                                 placeholder:text-[var(--muted-foreground)]/60
                                                 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20
                                                 transition-all duration-200"
                                    />
                                    <FiSearch className="absolute left-3 top-3.5 w-4 h-4 text-[var(--muted-foreground)]" />
                                </form>

                                {/* Mobile Navigation Links */}
                                <div className="space-y-2">
                                    <NavLink 
                                        to="/"
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                                            transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                                : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                            }
                                        `}
                                    >
                                        <FiHome className="w-5 h-5" />
                                        <span>Home</span>
                                    </NavLink>
                                    
                                    <NavLink 
                                        to="/menu"
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                                            transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                                : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                            }
                                        `}
                                    >
                                        <span className="text-lg">🍽️</span>
                                        <span>Menu</span>
                                    </NavLink>

                                    <NavLink 
                                        to="/about"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                                            transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                                : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                            }
                                        `}
                                    >
                                        <span className="text-lg">✨</span>
                                        <span>About Us</span>
                                    </NavLink>

                                    {isAuthenticated && (
                                        <NavLink 
                                            to="/favorites"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                                                flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm
                                                transition-colors duration-200
                                                ${isActive 
                                                    ? 'bg-rose-500/10 text-rose-500' 
                                                    : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FiHeart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                                                <span>Favorites</span>
                                            </div>
                                            {favoritesCount > 0 && (
                                                <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                    {favoritesCount}
                                                </span>
                                            )}
                                        </NavLink>
                                    )}
                                    
                                    {isAuthenticated && (
                                        <>
                                            <NavLink 
                                                to="/orders"
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                                                    transition-colors duration-200
                                                    ${isActive 
                                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                                        : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                                    }
                                                `}
                                            >
                                                <span className="text-lg">📦</span>
                                                <span>Orders</span>
                                            </NavLink>
                                            
                                            <NavLink 
                                                to="/profile"
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                                                    transition-colors duration-200
                                                    ${isActive 
                                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                                        : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                                    }
                                                `}
                                            >
                                                <FiUser className="w-5 h-5" />
                                                <span>Profile</span>
                                            </NavLink>

                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <span className="text-lg">👑</span>
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            {user?.role === 'driver' && (
                                                <Link
                                                    to="/driver/available"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <span className="text-lg">🛵</span>
                                                    <span>Driver Portal</span>
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                         text-rose-500 hover:bg-rose-500/10
                                                         transition-colors duration-200 mt-2 font-semibold text-sm cursor-pointer"
                                            >
                                                <FiLogOut className="w-5 h-5" />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Mobile Cart & Auth */}
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <div className="mb-4 p-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1 mb-2">
                                            Appearance
                                        </div>
                                        <ThemeSwitcher variant="segmented" className="w-full justify-between" />
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            openCart();
                                        }}
                                        className="w-full flex items-center justify-between p-4 
                                                 bg-[var(--background)] border border-[var(--border)] rounded-2xl cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiShoppingCart className="w-5 h-5 text-[var(--primary)]" />
                                            <span className="font-bold text-[var(--foreground)] text-sm">
                                                View Cart
                                            </span>
                                        </div>
                                        {cartItemCount > 0 && (
                                            <span className="px-2.5 py-1 bg-[var(--primary)] text-white 
                                                           text-xs font-bold rounded-full">
                                                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                                            </span>
                                        )}
                                    </button>

                                    {!isAuthenticated && (
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-center gap-2 p-3
                                                         border border-[var(--border)]
                                                         rounded-xl text-[var(--foreground)] bg-[var(--background)]
                                                         hover:border-[var(--primary)] transition-colors font-semibold text-sm cursor-pointer"
                                            >
                                                <FiLogIn className="w-4 h-4" />
                                                <span>Login</span>
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-center gap-2 p-3
                                                         bg-[var(--primary)] text-white rounded-xl
                                                         hover:opacity-90 transition-opacity font-semibold text-sm shadow-md cursor-pointer"
                                            >
                                                <FiUserPlus className="w-4 h-4" />
                                                <span>Sign up</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Spacer to prevent content from hiding behind fixed navbar */}
            <div className="h-16 md:h-20" />
        </>
    );
};

export default Navbar;
