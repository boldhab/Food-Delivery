import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  FiTruck, 
  FiPackage, 
  FiClock, 
  FiLogOut, 
  FiUser, 
  FiRadio, 
  FiCheckCircle, 
  FiPower, 
  FiNavigation,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2
} from "react-icons/fi";
import { useDriverAuth } from "../context/DriverAuthContext";
import driverOrderService from "../services/driverOrderService";
import toast from "react-hot-toast";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const DriverLayout = () => {
  const { user, logout } = useDriverAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const [isOnline, setIsOnline] = useState(() => {
    return localStorage.getItem("driver_is_online") !== "false";
  });
  const [driverProfile, setDriverProfile] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const loadDriverProfile = async () => {
    try {
      const profile = await driverOrderService.getDriverProfile();
      if (profile) {
        setDriverProfile(profile);
        if (typeof profile.isAvailable === "boolean") {
          setIsOnline(profile.isAvailable);
          localStorage.setItem("driver_is_online", String(profile.isAvailable));
        }
      }
    } catch (err) {
      // quiet fallback
    }
  };

  const toggleOnlineStatus = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    localStorage.setItem("driver_is_online", String(nextStatus));
    try {
      await driverOrderService.updateDriverStatus(nextStatus);
      if (nextStatus) {
        toast.success("You are now ONLINE & ready for orders!", { icon: "🟢" });
      } else {
        toast("You are now OFFLINE (Shift paused)", { icon: "⏸️" });
      }
    } catch (err) {
      toast.error("Failed to sync duty status with server");
    }
  };

  const checkCounts = async () => {
    try {
      const [avail, myActive] = await Promise.all([
        driverOrderService.getAvailableOrders(),
        driverOrderService.getMyDeliveries("out_for_delivery")
      ]);
      setAvailableCount(Array.isArray(avail) ? avail.length : 0);
      setActiveCount(Array.isArray(myActive) ? myActive.length : 0);
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    loadDriverProfile();
    checkCounts();
    const interval = setInterval(() => {
      checkCounts();
      loadDriverProfile();
    }, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/driver/login", { replace: true });
  };

  const todayEarnings = (
    driverProfile?.todayEarnings !== undefined
      ? Number(driverProfile.todayEarnings)
      : (driverProfile?.totalEarnings ? Number(driverProfile.totalEarnings) : 0)
  ).toFixed(2);

  const todayTrips = (
    driverProfile?.todayTrips !== undefined
      ? Number(driverProfile.todayTrips)
      : (driverProfile?.completedDeliveries ? Number(driverProfile.completedDeliveries) : 0)
  );

  return (
    <div className="driver-portal-container font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 flex items-center justify-between gap-3">
          {/* Driver Profile & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link to="/driver/available" className="flex items-center gap-2 shrink-0 group" title="Food Hub Courier">
              <img src="/LOGO.png" alt="Food Hub Courier" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold shrink-0">
              <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">
                  {user?.name || "Delivery Courier"}
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                  Driver
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  ★ {driverProfile?.rating?.toFixed(1) || "5.0"}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {driverProfile?.completedDeliveries || 0} Deliveries
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (hidden on mobile, visible on md+) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <NavLink
              to="/driver/available"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <FiRadio className="w-4 h-4" />
              <span>Available</span>
              {availableCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                  {availableCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/driver/my-deliveries"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <FiPackage className="w-4 h-4" />
              <span>My Trips</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                  {activeCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/driver/delivery-history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <FiClock className="w-4 h-4" />
              <span>History</span>
            </NavLink>
          </nav>

          {/* Right Action Controls: Duty Toggle, Theme, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Online / Offline Shift Toggle */}
            <button
              onClick={toggleOnlineStatus}
              title={isOnline ? "Click to go Offline" : "Click to go Online"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-slate-400 dark:bg-slate-500"}`} />
              <span className="text-[10px] sm:text-[11px] font-black">{isOnline ? "ON DUTY" : "OFFLINE"}</span>
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher
              variant="dropdown"
              align="end"
              buttonClassName="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors"
            />

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors border border-slate-200 dark:border-slate-700/60"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Header Shift Ticker: Today: XX.XX ETB • X Trips */}
        <div className="bg-slate-100/90 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 transition-colors">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
                <span>Today:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{todayEarnings} ETB</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">{todayTrips} {todayTrips === 1 ? 'Trip' : 'Trips'}</span>
              </span>
            </div>

            <Link
              to="/driver/delivery-history"
              className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>Shift Details</span>
              <FiChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-4 sm:pt-6 pb-24 md:pb-8">
        {!isOnline && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <FiPower className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You are currently <strong>Offline</strong>. Turn on duty to receive delivery requests.</span>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shrink-0 self-end sm:self-auto cursor-pointer"
            >
              Go Online
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile-First Fixed Bottom Navigation Bar (Visible on mobile < md, hidden on desktop md+) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 driver-safe-bottom shadow-2xl transition-colors">
        <div className="max-w-xl mx-auto grid grid-cols-3 h-16">
          {/* Available Orders */}
          <NavLink
            to="/driver/available"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <FiRadio className="w-5 h-5" />
                  {availableCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                      {availableCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">Available</span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </>
            )}
          </NavLink>

          {/* Active Deliveries */}
          <NavLink
            to="/driver/my-deliveries"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <FiPackage className="w-5 h-5" />
                  {activeCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                      {activeCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">My Trips</span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </>
            )}
          </NavLink>

          {/* Delivery History */}
          <NavLink
            to="/driver/delivery-history"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FiClock className="w-5 h-5" />
                <span className="text-[11px] tracking-tight">History</span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default DriverLayout;
