import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPieChart,
  FiBell,
  FiTrendingUp,
  FiMessageSquare,
  FiClock,
  FiCreditCard,
  FiTruck,
  FiUserCheck,
  FiCheckCircle,
  FiXCircle,
  FiGift,
  FiBarChart2,
  FiActivity,
  FiGrid
} from "react-icons/fi";
import { useAdminAuth } from "../../hooks/useAdminAuth";
const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  variant = "default",
  showUserProfile = true,
  showQuickActions = true,
  showRecentItems = true
}) => {
  const { user, logout, hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const menuItems = [
    {
      path: "/admin",
      icon: FiHome,
      label: "Dashboard",
      badge: 3,
      badgeColor: "bg-orange-500"
    },
    {
      path: "/admin/orders",
      icon: FiShoppingBag,
      label: "Orders",
      badge: 12,
      badgeColor: "bg-blue-500",
      children: [
        { path: "/admin/orders?status=pending", icon: FiActivity, label: "Pending" },
        { path: "/admin/orders?status=delivered", icon: FiCheckCircle, label: "Completed" },
        { path: "/admin/orders?status=cancelled", icon: FiXCircle, label: "Cancelled" }
      ]
    },
    {
      path: "/admin/foods",
      icon: FiPackage,
      label: "Food Items",
      children: [
        { path: "/admin/foods/menu", icon: FiGrid, label: "Menu" },
        { path: "/admin/foods/categories", icon: FiGrid, label: "Categories" },
        { path: "/admin/foods/inventory", icon: FiPackage, label: "Inventory" }
      ]
    },
    {
      path: "/admin/users",
      icon: FiUsers,
      label: "Users",
      badge: 5,
      badgeColor: "bg-green-500",
      children: [
        { path: "/admin/users/customers", icon: FiUserCheck, label: "Customers" },
        { path: "/admin/users/drivers", icon: FiTruck, label: "Drivers" },
        { path: "/admin/users/admins", icon: FiUsers, label: "Admins" }
      ]
    },
    {
      path: "/admin/reports",
      icon: FiPieChart,
      label: "Analytics",
      children: [
        { path: "/admin/reports/sales", icon: FiTrendingUp, label: "Sales" },
        { path: "/admin/reports/revenue", icon: FiBarChart2, label: "Revenue" },
        { path: "/admin/reports/users", icon: FiUsers, label: "User Activity" }
      ]
    },
    {
      path: "/admin/promotions",
      icon: FiGift,
      label: "Promotions",
      permissions: ["manage_promotions"]
    },
    {
      path: "/admin/messages",
      icon: FiMessageSquare,
      label: "Messages",
      badge: 8,
      badgeColor: "bg-purple-500"
    },
    {
      path: "/admin/settings",
      icon: FiSettings,
      label: "Settings",
      children: [
        { path: "/admin/settings/general", icon: FiSettings, label: "General" },
        { path: "/admin/settings/payment", icon: FiCreditCard, label: "Payment" },
        { path: "/admin/settings/notifications", icon: FiBell, label: "Notifications" }
      ]
    }
  ];
  useEffect(() => {
    const saved = localStorage.getItem("recentAdminItems");
    if (saved) {
      setRecentItems(JSON.parse(saved));
    }
  }, []);
  useEffect(() => {
    if (location.pathname !== "/admin") {
      const item = menuItems.find(
        (m) => location.pathname.startsWith(m.path) && m.path !== "/admin"
      );
      if (item) {
        const updated = [item.label, ...recentItems.filter((i) => i !== item.label)].slice(0, 3);
        setRecentItems(updated);
        localStorage.setItem("recentAdminItems", JSON.stringify(updated));
      }
    }
  }, [location.pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setIsDesktop(media.matches);
      if (media.matches) {
        setMobileOpen(false);
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [setMobileOpen]);
  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
    setMobileOpen(false);
  };
  const toggleSubmenu = (label) => {
    setExpandedMenus(
      (prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };
  const hasActiveChild = (item) => {
    if (!item.children) return false;
    const current = `${location.pathname}${location.search || ""}`;
    return item.children.some((child) => current === child.path);
  };
  const visibleMenuItems = menuItems.filter(
    (item) => !item.permissions || item.permissions.every((p) => hasPermission(p))
  );
  const quickActions = [
    { icon: FiShoppingBag, label: "Orders", action: () => navigate("/admin/orders") },
    { icon: FiPackage, label: "Add Food", action: () => navigate("/admin/foods/add") },
    { icon: FiUsers, label: "Users", action: () => navigate("/admin/users") }
  ];
  return <>
            {
    /* Mobile Overlay */
  }
            <AnimatePresence>
                {mobileOpen && !isDesktop && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setMobileOpen(false)}
    className="fixed inset-0 bg-black/50 z-30 md:hidden"
  />}
            </AnimatePresence>

            <motion.aside
    initial={false}
    animate={{
      width: collapsed ? 80 : 280,
      x: isDesktop ? 0 : mobileOpen ? 0 : -320
    }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={`
                    fixed md:relative z-40 flex h-screen flex-col
                    bg-white dark:bg-slate-900
                    border-r border-slate-200 dark:border-slate-800
                    shadow-xl md:shadow-none
                    ${collapsed ? "items-center" : ""}
                `}
  >
                {
    /* Logo Area */
  }
                <div className={`
                    flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800
                    ${collapsed ? "justify-center" : "justify-between"}
                `}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500
                                      flex items-center justify-center text-white font-bold text-lg
                                      shadow-lg shadow-orange-500/25">
                            FH
                        </div>
                        {!collapsed && <div>
                                <span className="text-lg font-bold text-slate-900 dark:text-white block leading-tight">
                                    FoodieHub
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Admin Panel
                                </span>
                            </div>}
                    </div>
                    
                    {!collapsed && <button
    onClick={() => setCollapsed(!collapsed)}
    className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors hidden md:block"
    aria-label="Toggle sidebar"
  >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>}
                    
                    {collapsed && <button
    onClick={() => setCollapsed(!collapsed)}
    className="p-2 rounded-lg text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors hidden md:block"
    aria-label="Expand sidebar"
  >
                            <FiChevronRight className="w-5 h-5" />
                        </button>}
                </div>

                {
    /* User Profile */
  }
                {showUserProfile && !collapsed && <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500
                                          flex items-center justify-center text-white font-bold text-lg
                                          shadow-lg shadow-orange-500/25">
                                {user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {user?.name || "Admin User"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.email || "admin@foodiehub.com"}
                                </p>
                                <p className="text-[10px] text-orange-500 mt-0.5 font-medium">
                                    Administrator
                                </p>
                            </div>
                        </div>
                    </div>}

                {
    /* Quick Actions */
  }
                {showQuickActions && !collapsed && <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Quick Actions
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {quickActions.map((action, index) => <button
    key={index}
    onClick={action.action}
    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800
                                             hover:bg-orange-50 dark:hover:bg-orange-900/20
                                             group transition-colors"
    title={action.label}
  >
                                    <action.icon className="w-5 h-5 mx-auto text-slate-500
                                                           group-hover:text-orange-500 transition-colors" />
                                </button>)}
                        </div>
                    </div>}

                {
    /* Navigation Menu */
  }
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-1">
                        {visibleMenuItems.map((item) => {
    const isActive = location.pathname === item.path || hasActiveChild(item);
    const isExpanded = expandedMenus.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;
    return <div key={item.path}>
                                    {
      /* Main Menu Item */
    }
                                    <div
      className="relative"
      onMouseEnter={() => setHoveredItem(item.label)}
      onMouseLeave={() => setHoveredItem(null)}
    >
                                        <NavLink
      to={item.path}
      onClick={(e) => {
        if (hasChildren) {
          e.preventDefault();
          toggleSubmenu(item.label);
        } else {
          if (!isDesktop) setMobileOpen(false);
        }
      }}
      className={({ isActive: isActive2 }) => `
                                                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                transition-all duration-200 relative
                                                ${collapsed ? "justify-center" : ""}
                                                ${isActive2 || isExpanded ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}
                                            `}
    >
                                            <item.icon className="w-5 h-5" />
                                            
                                            {!collapsed && <>
                                                    <span className="flex-1 text-sm font-medium">
                                                        {item.label}
                                                    </span>
                                                    
                                                    {
      /* Badge */
    }
                                                    {item.badge && <span className={`
                                                            px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                                            text-white ${item.badgeColor || "bg-orange-500"}
                                                        `}>
                                                            {item.badge}
                                                        </span>}
                                                    
                                                    {
      /* Submenu arrow */
    }
                                                    {hasChildren && <motion.div
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
                                                            <FiChevronRight className="w-4 h-4" />
                                                        </motion.div>}
                                                </>}
                                        </NavLink>

                                        {
      /* Tooltip for collapsed mode */
    }
                                        {collapsed && hoveredItem === item.label && <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-900 text-white
                                                          text-xs rounded shadow-lg z-50 whitespace-nowrap">
                                                {item.label}
                                                {item.badge && <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px]
                                                                   text-white ${item.badgeColor || "bg-orange-500"}`}>
                                                        {item.badge}
                                                    </span>}
                                            </div>}
                                    </div>

                                    {
      /* Submenu */
    }
                                    <AnimatePresence>
                                        {hasChildren && isExpanded && !collapsed && <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
                                                <div className="ml-9 mt-1 space-y-1">
                                                    {item.children?.map((child) => <NavLink
      key={child.path}
      to={child.path}
      onClick={() => {
        if (!isDesktop) setMobileOpen(false);
      }}
      className={({ isActive: isActive2 }) => `
                                                                flex items-center gap-3 px-3 py-2 rounded-lg
                                                                text-sm transition-all duration-200
                                                                ${isActive2 ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}
                                                            `}
    >
                                                            <child.icon className="w-4 h-4" />
                                                            <span>{child.label}</span>
                                                        </NavLink>)}
                                                </div>
                                            </motion.div>}
                                    </AnimatePresence>
                                </div>;
  })}
                    </div>

                    {
    /* Recent Items */
  }
                    {showRecentItems && !collapsed && recentItems.length > 0 && <div className="mt-8">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                                Recent
                            </p>
                            <div className="space-y-1">
                                {recentItems.map((item, index) => <div key={index} className="px-3 py-2 text-sm text-slate-600
                                                              dark:text-slate-400 flex items-center gap-2">
                                        <FiClock className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{item}</span>
                                    </div>)}
                            </div>
                        </div>}
                </nav>

                {
    /* Footer */
  }
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    {
    /* Logout Button */
  }
                    <button
    onClick={handleLogout}
    className={`
                            flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                            text-slate-600 dark:text-slate-400
                            hover:bg-red-50 dark:hover:bg-red-900/20
                            hover:text-red-600 dark:hover:text-red-400
                            transition-all duration-200
                            ${collapsed ? "justify-center" : ""}
                        `}
  >
                        <FiLogOut className="w-5 h-5" />
                        {!collapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>

                    {
    /* Version Info */
  }
                    {!collapsed && <div className="mt-3 text-center">
                            <span className="text-[10px] text-slate-400">
                                Version 2.1.0
                            </span>
                        </div>}
                </div>
            </motion.aside>
        </>;
};
var stdin_default = Sidebar;
export {
  stdin_default as default
};
