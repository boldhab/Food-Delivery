import { useState, useEffect, useRef, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
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
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAdminAuth as useAuth } from "../../hooks/useAdminAuth";
import useNotifications from "../../hooks/useAdminNotifications";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const AdminLayoutContent = ({
  children,
  title,
  showHeader = true,
  showFooter = true,
  fullWidth = true,
  className = ""
}) => {
  const { isMobile } = useSidebar();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const mainContainerRef = useRef(null);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 10);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
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
  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes("/admin/dispatch") || path.includes("/admin/live")) return "Order Dispatch Center";
    if (path === "/admin" || path.includes("/admin/dashboard")) return "Dashboard";
    if (path.includes("/admin/orders")) return "Orders";
    if (path.includes("/admin/foods") || path.includes("/admin/menu")) return "Food Items";
    if (path.includes("/admin/users")) return "Users & Fleet";
    if (path.includes("/admin/promotions")) return "Promotions & Deals";
    if (path.includes("/admin/reports/sales")) return "Sales & Revenue Analytics";
    if (path.includes("/admin/reports/inventory")) return "Inventory & Stock Analytics";
    if (path.includes("/admin/reports/drivers")) return "Driver Analytics";
    if (path.includes("/admin/reports/sla")) return "Delivery SLA & Logistics";
    if (path.includes("/admin/reports/financial")) return "Financial & COD Reconciliation";
    if (path.includes("/admin/reports")) return "Analytics & Reports";
    if (path.includes("/admin/settings")) return "Settings";
    if (path.includes("/admin/messages")) return "Messages";
    return "Admin Dashboard";
  };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        ref={mainContainerRef}
        className={cn(
          "flex h-dvh min-w-0 flex-1 flex-col transition-all duration-200 relative overflow-y-auto overflow-x-hidden",
          {
            "w-full": isMobile,
          }
        )}
      >
        {/* Header */}
        {showHeader && (
          <header
            className={`
              sticky top-0 z-10 transition-all duration-300
              ${
                isScrolled
                  ? "bg-[var(--card)]/90 backdrop-blur-md elevation-2"
                  : "bg-[var(--card)]"
              }
              border-b border-[var(--border)]
            `}
          >
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="flex items-center justify-between h-16">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                  {/* Page Title & Breadcrumbs */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold tracking-tight text-foreground">
                      {getPageTitle()}
                    </span>

                    <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="opacity-40">/</span>
                      <span className="capitalize">
                        {location.pathname.split("/").pop()}
                      </span>
                    </nav>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2.5">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="hidden md:block">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search dispatch, orders, menu..."
                        className="w-60 pl-9 pr-3.5 h-9 bg-background
                          border border-border rounded-xl
                          text-xs text-foreground
                          placeholder:text-muted-foreground/60
                          focus:outline-none focus:border-primary
                          focus:ring-2 focus:ring-primary/20
                          transition-all duration-200"
                      />
                    </div>
                  </form>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground
                      hover:bg-slate-100 dark:hover:bg-slate-800
                      transition-colors hidden lg:flex cursor-pointer"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
                  </button>

                  {/* Theme Switcher */}
                  <ThemeSwitcher variant="dropdown" align="end" />

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const nextState = !showNotifications;
                        setShowNotifications(nextState);
                        if (nextState) {
                          refreshNotifications();
                        }
                      }}
                      className="relative h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground
                        hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800
                        transition-colors cursor-pointer"
                      title="Notifications"
                    >
                      <FiBell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4
                          bg-primary text-white text-[10px] font-black
                          rounded-full flex items-center justify-center
                          animate-pulse shadow-xs">
                          {unreadCount > 9 ? "9+" : unreadCount}
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
                          className="absolute right-0 mt-2 w-80 bg-[var(--popover)]
                            rounded-2xl elevation-3 border border-[var(--border)]
                            overflow-hidden z-50 text-[var(--foreground)]"
                        >
                          <div className="p-4 border-b border-[var(--border)]">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-sm text-[var(--foreground)]">
                                Notifications
                              </h3>
                              {unreadCount > 0 && (
                                <button
                                  onClick={markAllAsRead}
                                  className="text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                                >
                                  Mark all as read
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center">
                                <FiBell className="w-10 h-10 mx-auto mb-3 text-[var(--muted-foreground)] opacity-40" />
                                <p className="text-xs font-medium text-[var(--muted-foreground)]">
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
                                    p-3.5 border-b last:border-b-0
                                    border-[var(--border)]
                                    cursor-pointer transition-colors
                                    ${
                                      notification.read
                                        ? "hover:bg-[var(--background)]"
                                        : "bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15"
                                    }
                                  `}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`
                                        w-8 h-8 rounded-xl flex items-center
                                        justify-center shrink-0 text-xs font-bold
                                        ${notification.type === "success" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}
                                        ${notification.type === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400"}
                                        ${notification.type === "error" && "bg-rose-500/15 text-rose-500"}
                                        ${notification.type === "info" && "bg-[var(--secondary-container)] text-[var(--secondary)]"}
                                      `}
                                    >
                                      {notification.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-[var(--foreground)] truncate">
                                        {notification.title}
                                      </p>
                                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-[10px] text-[var(--muted-foreground)]/80 mt-1 font-mono">
                                        {notification.time}
                                      </p>
                                    </div>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-[var(--primary)] rounded-full shrink-0 mt-1" />
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-3 border-t border-[var(--border)]">
                            <button
                              onClick={() => {
                                setShowNotifications(false);
                                navigate("/admin/notifications");
                              }}
                              className="w-full px-3 py-2 text-center text-xs font-bold
                                text-[var(--primary)] hover:bg-[var(--background)]
                                rounded-xl transition-colors cursor-pointer"
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
                      className="flex items-center gap-2 h-9 pl-1.5 pr-2.5
                        rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
                        transition-colors cursor-pointer border border-transparent hover:border-border"
                    >
                      <div className="w-7 h-7 bg-primary text-white
                        rounded-lg flex items-center justify-center
                        font-bold text-xs shadow-2xs">
                        {user?.name?.charAt(0) || "A"}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-xs font-bold text-foreground leading-tight">
                          {user?.name || "Admin User"}
                        </div>
                        <div className="text-2xs text-muted-foreground leading-none">
                          {user?.role || "Administrator"}
                        </div>
                      </div>
                      <FiChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-[var(--popover)]
                            rounded-2xl elevation-3 border border-[var(--border)]
                            overflow-hidden z-50 text-[var(--foreground)]"
                        >
                          <div className="p-2">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate("/admin/profile");
                              }}
                              className="w-full px-3 py-2 text-left rounded-xl
                                text-xs font-medium text-[var(--foreground)]
                                hover:bg-[var(--background)]
                                flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FiUser className="w-4 h-4 text-[var(--muted-foreground)]" />
                              Profile
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate("/admin/settings");
                              }}
                              className="w-full px-3 py-2 text-left rounded-xl
                                text-xs font-medium text-[var(--foreground)]
                                hover:bg-[var(--background)]
                                flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FiSettings className="w-4 h-4 text-[var(--muted-foreground)]" />
                              Settings
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate("/admin/help");
                              }}
                              className="w-full px-3 py-2 text-left rounded-xl
                                text-xs font-medium text-[var(--foreground)]
                                hover:bg-[var(--background)]
                                flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FiHelpCircle className="w-4 h-4 text-[var(--muted-foreground)]" />
                              Help & Support
                            </button>
                            <div className="my-1.5 border-t border-[var(--border)]" />
                            <button
                              onClick={handleLogout}
                              className="w-full px-3 py-2 text-left rounded-xl
                                text-xs font-semibold text-rose-500
                                hover:bg-rose-500/10
                                flex items-center gap-2.5 transition-colors cursor-pointer"
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
        <main
          className={`
            flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 w-full max-w-none transition-all duration-300
            ${className}
          `}
        >
          {/* Page Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[50vh] w-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        Loading view...
                      </span>
                    </div>
                  </div>
                }
              >
                {children || <Outlet />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        {showFooter && <Footer variant="admin" />}
      </div>
    </div>
  );
};

const AdminLayout = (props) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminLayoutContent {...props} />
    </SidebarProvider>
  );
};

export default AdminLayout;
