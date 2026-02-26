import React, { useState, useEffect } from 'react';
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
    FiSearch
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const { cart } = useCart();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
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

    return (
        <>
            <nav 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
                           ${isScrolled 
                               ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg' 
                               : 'bg-white dark:bg-slate-900'
                           }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo/Brand */}
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 
                                         bg-clip-text text-transparent">
                                FoodDash
                            </span>
                            <span className="text-2xl transform group-hover:rotate-12 transition-transform duration-300">
                                🍕
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            <NavLink 
                                to="/" 
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                                    px-4 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                Menu
                            </NavLink>
                            
                            {isAuthenticated && (
                                <NavLink 
                                    to="/orders" 
                                    className={({ isActive }) => `
                                        px-4 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${isActive 
                                            ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                            : 'text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    Orders
                                </NavLink>
                            )}
                        </div>

                        {/* Desktop Right Section */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="relative mr-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search food..."
                                    className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800
                                             border border-transparent focus:border-orange-500
                                             rounded-lg text-sm
                                             text-slate-900 dark:text-white
                                             placeholder:text-slate-400
                                             focus:outline-none focus:ring-2 focus:ring-orange-500/20
                                             transition-all duration-200"
                                />
                                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            </form>

                            {/* Cart */}
                            <NavLink 
                                to="/cart"
                                className={({ isActive }) => `
                                    relative p-2 rounded-lg
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 
                                                 bg-orange-500 text-white text-xs
                                                 rounded-full flex items-center justify-center
                                                 shadow-lg shadow-orange-500/25"
                                    >
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </motion.span>
                                )}
                            </NavLink>

                            {/* Notifications (if authenticated) */}
                            {isAuthenticated && (
                                <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 
                                                 hover:text-orange-500 hover:bg-slate-50 
                                                 dark:hover:bg-slate-800 transition-all duration-200
                                                 relative">
                                    <FiBell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 
                                                   bg-orange-500 rounded-full" />
                                </button>
                            )}

                            {/* Profile / Auth */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 pl-3 pr-2 py-2 
                                                 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800
                                                 transition-all duration-200
                                                 text-slate-700 dark:text-slate-300"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 
                                                      rounded-full flex items-center justify-center
                                                      text-white font-semibold text-sm
                                                      shadow-md shadow-orange-500/25">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-sm font-medium max-w-[100px] truncate">
                                            {user?.name?.split(' ')[0] || 'Profile'}
                                        </span>
                                        <FiChevronDown className={`w-4 h-4 transition-transform duration-200
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
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                                         rounded-xl shadow-xl border border-slate-200 
                                                         dark:border-slate-700 overflow-hidden"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-3
                                                             hover:bg-slate-50 dark:hover:bg-slate-700
                                                             text-slate-700 dark:text-slate-300
                                                             transition-colors duration-150"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <FiUser className="w-4 h-4" />
                                                    <span className="text-sm">Profile</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3
                                                             hover:bg-slate-50 dark:hover:bg-slate-700
                                                             text-red-600 dark:text-red-400
                                                             transition-colors duration-150
                                                             border-t border-slate-100 dark:border-slate-700"
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
                                                 dark:text-slate-300 hover:text-orange-500
                                                 transition-colors duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                                 text-white text-sm font-medium rounded-lg
                                                 transition-colors duration-200
                                                 shadow-lg shadow-orange-500/25"
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
                            className="md:hidden overflow-hidden bg-white dark:bg-slate-900
                                     border-t border-slate-200 dark:border-slate-800"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search food..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800
                                                 border border-transparent focus:border-orange-500
                                                 rounded-xl text-sm
                                                 text-slate-900 dark:text-white
                                                 placeholder:text-slate-400
                                                 focus:outline-none focus:ring-2 focus:ring-orange-500/20
                                                 transition-all duration-200"
                                    />
                                    <FiSearch className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                </form>

                                {/* Mobile Navigation Links */}
                                <div className="space-y-2">
                                    <NavLink 
                                        to="/"
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl
                                            transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <FiHome className="w-5 h-5" />
                                        <span className="font-medium">Home</span>
                                    </NavLink>
                                    
                                    <NavLink 
                                        to="/menu"
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl
                                            transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <span className="text-lg">🍽️</span>
                                        <span className="font-medium">Menu</span>
                                    </NavLink>
                                    
                                    {isAuthenticated && (
                                        <>
                                            <NavLink 
                                                to="/orders"
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl
                                                    transition-colors duration-200
                                                    ${isActive 
                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }
                                                `}
                                            >
                                                <span className="text-lg">📦</span>
                                                <span className="font-medium">Orders</span>
                                            </NavLink>
                                            
                                            <NavLink 
                                                to="/profile"
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl
                                                    transition-colors duration-200
                                                    ${isActive 
                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' 
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }
                                                `}
                                            >
                                                <FiUser className="w-5 h-5" />
                                                <span className="font-medium">Profile</span>
                                            </NavLink>
                                        </>
                                    )}
                                </div>

                                {/* Mobile Cart & Auth */}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <NavLink 
                                        to="/cart"
                                        className="flex items-center justify-between p-4 
                                                 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiShoppingCart className="w-5 h-5 text-orange-500" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                Cart
                                            </span>
                                        </div>
                                        {cartItemCount > 0 && (
                                            <span className="px-2 py-1 bg-orange-500 text-white 
                                                           text-sm rounded-full">
                                                {cartItemCount} items
                                            </span>
                                        )}
                                    </NavLink>

                                    {!isAuthenticated && (
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <Link
                                                to="/login"
                                                className="flex items-center justify-center gap-2 p-3
                                                         border border-slate-200 dark:border-slate-700
                                                         rounded-xl text-slate-700 dark:text-slate-300
                                                         hover:border-orange-500 transition-colors"
                                            >
                                                <FiLogIn className="w-4 h-4" />
                                                <span className="text-sm font-medium">Login</span>
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="flex items-center justify-center gap-2 p-3
                                                         bg-orange-500 text-white rounded-xl
                                                         hover:bg-orange-600 transition-colors"
                                            >
                                                <FiUserPlus className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sign up</span>
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
