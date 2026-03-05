import { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiChevronDown,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMaximize2,
  FiMinimize2,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";
const Header = ({
  toggleSidebar,
  sidebarCollapsed: _sidebarCollapsed = false,
  onThemeToggle,
  isDarkMode = false,
  title = "Admin Overview",
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showThemeToggle = true,
  showFullscreen = true,
  onSearch
}) => {
  void motion;
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(/* @__PURE__ */ new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  useEffect(() => {
    const mockNotifications = [
      {
        id: "1",
        type: "success",
        title: "New Order",
        message: "You have received a new order #1234",
        time: "2 minutes ago",
        read: false,
        link: "/admin/orders/1234",
        icon: <FiCheckCircle className="w-4 h-4" />
      },
      {
        id: "2",
        type: "warning",
        title: "Low Stock Alert",
        message: "Margherita Pizza is running low on stock",
        time: "1 hour ago",
        read: false,
        link: "/admin/menu",
        icon: <FiAlertCircle className="w-4 h-4" />
      },
      {
        id: "3",
        type: "info",
        title: "New User Registered",
        message: "John Doe just created an account",
        time: "2 hours ago",
        read: true,
        link: "/admin/users",
        icon: <FiInfo className="w-4 h-4" />
      },
      {
        id: "4",
        type: "success",
        title: "Payment Received",
        message: "Payment of $45.99 for order #1230 confirmed",
        time: "3 hours ago",
        read: true,
        icon: <FiCheckCircle className="w-4 h-4" />
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.read).length);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(/* @__PURE__ */ new Date());
    }, 6e4);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      setShowSearchResults(false);
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  const handleNotificationClick = (notification) => {
    setNotifications(
      (prev) => prev.map(
        (n) => n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    if (notification.link) {
      navigate(notification.link);
    }
    setIsNotificationsOpen(false);
  };
  const markAllAsRead = () => {
    setNotifications(
      (prev) => prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <FiX className="w-4 h-4 text-red-500" />;
      default:
        return <FiInfo className="w-4 h-4 text-blue-500" />;
    }
  };
  const searchSuggestions = [
    "Orders",
    "Users",
    "Menu items",
    "Reports",
    "Settings"
  ].filter(
    (item) => item.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return <motion.header
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6
                     bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                     border-b border-slate-200 dark:border-slate-800
                     shadow-sm"
  >
            {
    /* Left Section */
  }
            <div className="flex items-center gap-4">
                {
    /* Sidebar Toggle */
  }
                <button
    onClick={toggleSidebar}
    className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             transition-colors md:hidden"
    aria-label="Toggle sidebar"
  >
                    <FiMenu className="w-5 h-5" />
                </button>

                {
    /* Title and Welcome */
  }
                <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Welcome back,{" "}
                        <span className="font-medium text-orange-500">
                            {user?.name || "Admin"}
                        </span>
                    </p>
                </div>

                {
    /* Quick Stats */
  }
                <div className="hidden lg:flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5
                                  bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FiClock className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5
                                  bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FiCalendar className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {currentTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })}
                        </span>
                    </div>
                </div>
            </div>

            {
    /* Right Section */
  }
            <div className="flex items-center gap-2">
                {
    /* Search Bar */
  }
                {showSearch && <div className="relative hidden md:block" ref={searchRef}>
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                                                   text-slate-400 w-4 h-4" />
                                <input
    type="text"
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      setShowSearchResults(true);
    }}
    onFocus={() => setShowSearchResults(true)}
    placeholder="Search..."
    className="w-64 pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800
                                             border border-transparent rounded-lg
                                             text-sm text-slate-900 dark:text-white
                                             placeholder:text-slate-400
                                             focus:outline-none focus:border-orange-500
                                             focus:ring-2 focus:ring-orange-500/20
                                             transition-all duration-200"
  />
                            </div>
                        </form>

                        {
    /* Search Results */
  }
                        <AnimatePresence>
                            {showSearchResults && searchQuery && searchSuggestions.length > 0 && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 
                                             dark:border-slate-700 overflow-hidden z-50"
  >
                                    {searchSuggestions.map((suggestion, index) => <button
    key={index}
    onClick={() => {
      setSearchQuery(suggestion);
      setShowSearchResults(false);
      onSearch?.(suggestion);
      navigate(`/admin/search?q=${encodeURIComponent(suggestion)}`);
    }}
    className="w-full px-4 py-2 text-left text-sm
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2"
  >
                                            <FiSearch className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {suggestion}
                                            </span>
                                        </button>)}
                                </motion.div>}
                        </AnimatePresence>
                    </div>}

                {
    /* Mobile Search Toggle */
  }
                {showSearch && <button
    onClick={() => setIsSearchOpen(!isSearchOpen)}
    className="md:hidden p-2 rounded-lg text-slate-500
                                 hover:text-orange-500 hover:bg-slate-100
                                 dark:hover:bg-slate-800 transition-colors"
  >
                        <FiSearch className="w-5 h-5" />
                    </button>}

                {
    /* Fullscreen Toggle */
  }
                {showFullscreen && <button
    onClick={toggleFullscreen}
    className="hidden lg:flex p-2 rounded-lg text-slate-500
                                 hover:text-orange-500 hover:bg-slate-100
                                 dark:hover:bg-slate-800 transition-colors"
  >
                        {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                    </button>}

                {
    /* Theme Toggle */
  }
                {showThemeToggle && onThemeToggle && <button
    onClick={onThemeToggle}
    className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                 transition-colors"
  >
                        {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                    </button>}

                {
    /* Notifications */
  }
                {showNotifications && <div className="relative" ref={notificationsRef}>
                        <button
    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
    className="relative p-2 rounded-lg text-slate-500
                                     hover:text-orange-500 hover:bg-slate-100
                                     dark:hover:bg-slate-800 transition-colors"
  >
                            <FiBell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 flex items-center justify-center
                                               w-4 h-4 bg-orange-500 text-white text-[10px]
                                               font-bold rounded-full ring-2 ring-white
                                               dark:ring-slate-900 animate-pulse">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>}
                        </button>

                        {
    /* Notifications Dropdown */
  }
                        <AnimatePresence>
                            {isNotificationsOpen && <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 
                                             dark:border-slate-700 overflow-hidden z-50"
  >
                                    {
    /* Header */
  }
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Notifications
                                            </h3>
                                            {unreadCount > 0 && <button
    onClick={markAllAsRead}
    className="text-xs text-orange-500 hover:text-orange-600
                                                             transition-colors"
  >
                                                    Mark all as read
                                                </button>}
                                        </div>
                                    </div>

                                    {
    /* Notifications List */
  }
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? <div className="p-8 text-center">
                                                <FiBell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                                <p className="text-sm text-slate-500">
                                                    No notifications
                                                </p>
                                            </div> : notifications.map((notification) => <button
    key={notification.id}
    onClick={() => handleNotificationClick(notification)}
    className={`
                                                        w-full p-4 text-left border-b last:border-b-0
                                                        border-slate-100 dark:border-slate-700
                                                        transition-colors
                                                        ${notification.read ? "hover:bg-slate-50 dark:hover:bg-slate-700" : "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30"}
                                                    `}
  >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center
                                                            shrink-0
                                                            ${notification.type === "success" && "bg-green-100 text-green-600"}
                                                            ${notification.type === "warning" && "bg-yellow-100 text-yellow-600"}
                                                            ${notification.type === "error" && "bg-red-100 text-red-600"}
                                                            ${notification.type === "info" && "bg-blue-100 text-blue-600"}
                                                        `}>
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {notification.time}
                                                            </p>
                                                        </div>
                                                        {!notification.read && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />}
                                                    </div>
                                                </button>)}
                                    </div>

                                    {
    /* Footer */
  }
                                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                        <button
    onClick={() => {
      setIsNotificationsOpen(false);
      navigate("/admin/notifications");
    }}
    className="w-full px-3 py-2 text-center text-sm
                                                     text-orange-500 hover:text-orange-600
                                                     hover:bg-slate-50 dark:hover:bg-slate-700
                                                     rounded-lg transition-colors"
  >
                                            View all notifications
                                        </button>
                                    </div>
                                </motion.div>}
                        </AnimatePresence>
                    </div>}

                {
    /* Divider */
  }
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                {
    /* User Menu */
  }
                {showUserMenu && <div className="relative" ref={userMenuRef}>
                        <button
    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
    className="flex items-center gap-3 pl-2 pr-3 py-1.5
                                     rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors"
  >
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {user?.name || "Admin User"}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400
                                           uppercase tracking-wider">
                                    Administrator
                                </p>
                            </div>
                            
                            <div className="h-10 w-10 flex items-center justify-center
                                          rounded-xl bg-linear-to-br from-orange-500 to-amber-500
                                          text-white shadow-lg ring-2 ring-white
                                          dark:ring-slate-800">
                                {user?.avatar ? <img
    src={user.avatar}
    alt={user.name}
    className="w-full h-full rounded-xl object-cover"
  /> : <FiUser className="text-lg" />}
                            </div>
                            
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform
                                                      ${isUserMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {
    /* User Menu Dropdown */
  }
                        <AnimatePresence>
                            {isUserMenuOpen && <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 
                                             dark:border-slate-700 overflow-hidden z-50"
  >
                                    {
    /* User Info */
  }
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {user?.name || "Admin User"}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {user?.email || "admin@foodiehub.com"}
                                        </p>
                                    </div>

                                    {
    /* Menu Items */
  }
                                    <div className="p-2">
                                        <button
    onClick={() => {
      setIsUserMenuOpen(false);
      navigate("/admin/profile");
    }}
    className="w-full px-3 py-2 text-left rounded-lg
                                                     text-sm text-slate-700 dark:text-slate-300
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2 transition-colors"
  >
                                            <FiUser className="w-4 h-4" />
                                            Profile
                                        </button>
                                        
                                        <button
    onClick={() => {
      setIsUserMenuOpen(false);
      navigate("/admin/settings");
    }}
    className="w-full px-3 py-2 text-left rounded-lg
                                                     text-sm text-slate-700 dark:text-slate-300
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2 transition-colors"
  >
                                            <FiSettings className="w-4 h-4" />
                                            Settings
                                        </button>
                                        
                                        <button
    onClick={() => {
      setIsUserMenuOpen(false);
      navigate("/admin/help");
    }}
    className="w-full px-3 py-2 text-left rounded-lg
                                                     text-sm text-slate-700 dark:text-slate-300
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2 transition-colors"
  >
                                            <FiHelpCircle className="w-4 h-4" />
                                            Help & Support
                                        </button>
                                        
                                        <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
                                        
                                        <button
    onClick={logout}
    className="w-full px-3 py-2 text-left rounded-lg
                                                     text-sm text-red-600 dark:text-red-400
                                                     hover:bg-red-50 dark:hover:bg-red-900/20
                                                     flex items-center gap-2 transition-colors"
  >
                                            <FiLogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </motion.div>}
                        </AnimatePresence>
                    </div>}
            </div>

            {
    /* Mobile Search Panel */
  }
            <AnimatePresence>
                {isSearchOpen && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="absolute left-0 right-0 top-16 p-4 bg-white dark:bg-slate-900
                                 border-b border-slate-200 dark:border-slate-800
                                 shadow-lg md:hidden"
  >
                        <form onSubmit={handleSearch} className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                                               text-slate-400 w-4 h-4" />
                            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search..."
    className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-slate-800
                                         border border-transparent rounded-lg
                                         text-sm text-slate-900 dark:text-white
                                         placeholder:text-slate-400
                                         focus:outline-none focus:border-orange-500
                                         focus:ring-2 focus:ring-orange-500/20"
    autoFocus
  />
                        </form>
                    </motion.div>}
            </AnimatePresence>
        </motion.header>;
};
var stdin_default = Header;
export {
  stdin_default as default
};
