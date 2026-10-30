import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiTruck,
  FiShield,
  FiUser,
  FiPhone,
  FiMail,
  FiPackage,
  FiSlash,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiChevronDown
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import adminUserService from "../services/adminUserService";
import { formatCurrency } from "../utils/adminHelpers";
import { DataTablePagination } from "../components/common/table/DataTablePagination";
import { useAdminDataContext } from "../context/adminDataContextCore";

const ROUTE_ROLE_MAP = {
  "/admin/users/customers": "user",
  "/admin/users/drivers": "driver",
  "/admin/users/admins": "admin"
};

const UsersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { exportData, state: adminDataState } = useAdminDataContext();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [creatingDriver, setCreatingDriver] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "",
    plateNumber: "",
    licenseNumber: "",
    emergencyContact: ""
  });
  const [search, setSearch] = useState("");
  const roleFilter = useMemo(() => ROUTE_ROLE_MAP[location.pathname] || "", [location.pathname]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getUsers({
        role: roleFilter || undefined,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: search.trim() || undefined
      });
      setUsers(response?.data?.users || []);
      if (response?.data?.pagination) {
        const p = response.data.pagination;
        setPagination((prev) => ({
          ...prev,
          currentPage: Number(p.page || prev.currentPage),
          totalPages: Number(
            p.pages || Math.ceil((p.total || 0) / (p.limit || prev.itemsPerPage)) || 1
          ),
          totalItems: Number(p.total ?? 0),
          itemsPerPage: Number(p.limit || prev.itemsPerPage)
        }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, pagination.currentPage, pagination.itemsPerPage, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleNavigate = (path) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    navigate(path);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(prev.totalPages || 1, newPage))
    }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: Number(newSize),
      currentPage: 1
    }));
  };

  const handleToggleBan = async (targetUser) => {
    setUpdatingUserId(targetUser._id);
    try {
      await adminUserService.updateUserStatus(targetUser._id, { isActive: !targetUser.isActive });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === targetUser._id ? { ...user, isActive: !targetUser.isActive } : user
        )
      );
      toast.success(
        targetUser.isActive ? "User account suspended" : "User account activated"
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!driverForm.name || !driverForm.email || !driverForm.phone || !driverForm.password) {
      toast.error("Please fill in all required driver fields");
      return;
    }

    setCreatingDriver(true);
    try {
      const response = await adminUserService.createUser({
        name: driverForm.name,
        email: driverForm.email,
        phone: driverForm.phone,
        password: driverForm.password,
        role: "driver",
        driverProfile: {
          vehicleType: driverForm.vehicleType,
          plateNumber: driverForm.plateNumber,
          licenseNumber: driverForm.licenseNumber,
          emergencyContact: driverForm.emergencyContact
        }
      });
      toast.success(`Driver created successfully. Username: ${driverForm.email}`);
      setDriverForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        vehicleType: "",
        plateNumber: "",
        licenseNumber: "",
        emergencyContact: ""
      });
      setShowAddDriver(false);
      await loadUsers();
      if (response?.credentials?.username) {
        toast.success(`Login credentials sent to ${response.credentials.username}`);
      }
    } catch (error) {
      console.error("Failed to create driver:", error);
      toast.error(error?.response?.data?.message || "Failed to create driver");
    } finally {
      setCreatingDriver(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.phone || ""}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Oversee customers, fleet couriers, and administrative privileges.
          </p>
        </div>

        {/* Role Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "All Users", path: "/admin/users", role: "" },
            { label: "Customers", path: "/admin/users/customers", role: "user" },
            { label: "Couriers (Drivers)", path: "/admin/users/drivers", role: "driver" },
            { label: "Staff (Admins)", path: "/admin/users/admins", role: "admin" }
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => handleRoleNavigate(item.path)}
              className={`h-8 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === item.role
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "bg-card border border-border text-foreground hover:border-primary/50"
              }`}
            >
              {item.label}
            </button>
          ))}

          {roleFilter === "driver" && (
            <button
              onClick={() => setShowAddDriver((prev) => !prev)}
              className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer ml-1"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Courier
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              disabled={Boolean(adminDataState?.loading?.["export-users"])}
              className="h-8 px-3 rounded-xl border border-border bg-card text-foreground hover:border-primary/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Export Users"
            >
              <FiDownload className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{adminDataState?.loading?.["export-users"] ? "Exporting..." : "Export"}</span>
              <FiChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-1.5 w-48 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-20"
                >
                  <div className="px-3 py-1.5 border-b border-border bg-slate-50 dark:bg-slate-900/40">
                    <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                      Scope: {roleFilter ? `${roleFilter.toUpperCase()}s` : "All Users"}
                    </p>
                  </div>
                  {["csv", "excel", "pdf"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={async () => {
                        setShowExportMenu(false);
                        await exportData("users", fmt, {
                          filters: {
                            role: roleFilter || undefined,
                            search: search.trim() || undefined
                          }
                        });
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-semibold">{fmt.toUpperCase()}</span>
                      <span className="text-2xs text-muted-foreground">Download</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Driver Modal/Inline Card */}
      {roleFilter === "driver" && showAddDriver && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiTruck className="w-4 h-4 text-primary-600" />
              Register New Fleet Courier
            </h3>
            <button
              type="button"
              onClick={() => setShowAddDriver(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateDriver} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={driverForm.name}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name *"
              required
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.email}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email / Login ID *"
              type="email"
              required
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.phone}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone Number *"
              required
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.password}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Password *"
              type="password"
              required
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.vehicleType}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
              placeholder="Vehicle Type (Scooter, Car, Bike)"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.plateNumber}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, plateNumber: e.target.value }))}
              placeholder="Plate Number"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.licenseNumber}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              placeholder="Driver's License #"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <input
              value={driverForm.emergencyContact}
              onChange={(e) => setDriverForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="Emergency Contact"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
            />
            <div className="md:col-span-4 flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={creatingDriver}
                className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-xs"
              >
                {creatingDriver ? "Creating Driver..." : "Confirm & Register Courier"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search & Counter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="text-xs text-muted-foreground tabular-nums self-end sm:self-auto font-medium">
            {pagination.totalItems || filteredUsers.length} total entries
          </div>
        </div>

        {/* Content Section: Loading, Empty, or Role-Based Layout */}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FiUser className="w-6 h-6" />
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
              No users found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              No users match your criteria or active role filter.
            </p>
          </div>
        ) : roleFilter === "driver" ? (
          /* ========================================================
             1. DRIVERS / COURIERS: Roster Profile Cards Grid
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const profile = user.driverProfile || {};
              const vehicle = profile.vehicleType || "Courier";
              const plate = profile.plateNumber || "N/A";
              const totalOrders = user.stats?.totalOrders ?? 0;

              return (
                <div
                  key={user._id}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 p-4 flex flex-col justify-between hover:border-primary-400 hover:shadow-xs transition-all"
                >
                  <div>
                    {/* Header: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {(user.name || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                            {user.name}
                          </h3>
                          <span className="text-2xs text-slate-400 dark:text-slate-500 block">
                            Courier Partner
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <div className="flex items-center gap-2 text-2xs">
                        <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-2xs">
                          <FiPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Vehicle & Operational Info */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1.5 text-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <FiTruck className="w-3 h-3" /> Vehicle:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {vehicle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Plate Number:</span>
                        <span className="font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                          {plate}
                        </span>
                      </div>
                      {profile.licenseNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">License:</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {profile.licenseNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Trips & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-2xs">
                      <span className="text-slate-400">Trips: </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {totalOrders}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={updatingUserId === user._id}
                      onClick={() => handleToggleBan(user)}
                      className={`text-2xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        user.isActive
                          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 hover:bg-emerald-100"
                      }`}
                    >
                      {updatingUserId === user._id
                        ? "Saving..."
                        : user.isActive
                        ? "Suspend Courier"
                        : "Activate Courier"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : roleFilter === "admin" ? (
          /* ========================================================
             2. STAFF / ADMINS: Privilege Security Cards Grid
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 p-4 flex flex-col justify-between hover:border-primary-400 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm flex items-center justify-center shrink-0">
                        <FiShield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {user.name}
                        </h3>
                        <span className="text-2xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-2 py-0.2 rounded-full inline-block mt-0.5">
                          Administrator
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                      }`}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-2xs">
                      <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-2xs">
                        <FiPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={updatingUserId === user._id}
                    onClick={() => handleToggleBan(user)}
                    className={`text-2xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      user.isActive
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 hover:bg-emerald-100"
                    }`}
                  >
                    {updatingUserId === user._id
                      ? "Saving..."
                      : user.isActive
                      ? "Suspend Staff"
                      : "Activate Staff"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             3. CUSTOMERS / ALL USERS: Sleek Customer Row Strips
             ======================================================== */
          <div className="space-y-2.5">
            {filteredUsers.map((user) => {
              const totalOrders = user.stats?.totalOrders ?? 0;
              const totalSpent = Number(user.stats?.totalSpent || 0);

              return (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 hover:border-primary-400 transition-all hover:shadow-xs"
                >
                  {/* Left: Avatar, Name, Email, Phone, Role Badge */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user.name}
                        </span>
                        <span className="text-2xs px-2 py-0.2 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {user.role === "admin"
                            ? "Staff Admin"
                            : user.role === "driver"
                            ? "Courier"
                            : "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span className="truncate">{user.email}</span>
                        {user.phone && (
                          <>
                            <span>•</span>
                            <span>{user.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics, Status & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Orders Metric */}
                    <div className="text-right min-w-[60px]">
                      <span className="text-2xs text-slate-400 block">Orders</span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                        {totalOrders}
                      </span>
                    </div>

                    {/* Spend Metric */}
                    <div className="text-right min-w-[75px]">
                      <span className="text-2xs text-slate-400 block">Spent</span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                      }`}
                    >
                      {user.isActive ? "Active" : "Banned"}
                    </span>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={updatingUserId === user._id}
                      onClick={() => handleToggleBan(user)}
                      className={`text-2xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        user.isActive
                          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 hover:bg-emerald-100"
                      }`}
                    >
                      {updatingUserId === user._id
                        ? "Saving..."
                        : user.isActive
                        ? "Ban User"
                        : "Unban"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination Controls */}
        {pagination.totalItems > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <DataTablePagination
              currentPage={pagination.currentPage}
              pageSize={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
