import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import adminUserService from "../services/adminUserService";

const ROUTE_ROLE_MAP = {
  "/admin/users/customers": "user",
  "/admin/users/drivers": "driver",
  "/admin/users/admins": "admin"
};

const UsersPage = () => {
  void motion;
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [creatingDriver, setCreatingDriver] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
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
      const response = await adminUserService.getUsers(roleFilter ? { role: roleFilter } : {});
      setUsers(response?.data?.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBan = async (targetUser) => {
    setUpdatingUserId(targetUser._id);
    try {
      await adminUserService.updateUserStatus(targetUser._id, { isActive: !targetUser.isActive });
      setUsers((prev) => prev.map((user) => (
        user._id === targetUser._id ? { ...user, isActive: !targetUser.isActive } : user
      )));
      toast.success(targetUser.isActive ? "User banned successfully" : "User unbanned successfully");
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
      toast.error("Please fill in all driver fields");
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
      toast.success(`Driver created. Username: ${driverForm.email}`);
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
        toast.success(`Login username: ${response.credentials.username}`);
      }
    } catch (error) {
      console.error("Failed to create driver:", error);
      toast.error(error?.response?.data?.message || "Failed to create driver");
    } finally {
      setCreatingDriver(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>;
  }
  return <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--text-primary)">Users</h1>
                    <p className="text-sm text-(--text-secondary)">Track and manage your customer base.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[{
    label: "All",
    path: "/admin/users",
    role: ""
  }, {
    label: "Customers",
    path: "/admin/users/customers",
    role: "user"
  }, {
    label: "Drivers",
    path: "/admin/users/drivers",
    role: "driver"
  }, {
    label: "Admins",
    path: "/admin/users/admins",
    role: "admin"
  }].map((item) => <button
    key={item.path}
    onClick={() => navigate(item.path)}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === item.role ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-orange-400"}`}
  >
                        {item.label}
                    </button>)}
                    {roleFilter === "driver" && <button
    onClick={() => setShowAddDriver((prev) => !prev)}
    className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
  >
                        <FiPlus className="w-4 h-4" />
                        Add Driver
                    </button>}
                </div>
            </div>

                <div className="rounded-2xl bg-(--surface) border border-slate-100 shadow-sm p-4 md:p-6">
                {roleFilter === "driver" && showAddDriver && <form onSubmit={handleCreateDriver} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
    value={driverForm.name}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, name: e.target.value }))}
    placeholder="Driver name"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.email}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, email: e.target.value }))}
    placeholder="Username (email)"
    type="email"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.phone}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, phone: e.target.value }))}
    placeholder="Phone"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.password}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, password: e.target.value }))}
    placeholder="Password"
    type="password"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.vehicleType}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
    placeholder="Vehicle type"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.plateNumber}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, plateNumber: e.target.value }))}
    placeholder="Plate number"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.licenseNumber}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
    placeholder="License number"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <input
    value={driverForm.emergencyContact}
    onChange={(e) => setDriverForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
    placeholder="Emergency contact"
    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
  />
                        <button
    type="submit"
    disabled={creatingDriver}
    className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
  >
                            {creatingDriver ? "Creating..." : "Create Driver"}
                        </button>
                    </form>}

                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-3 text-(--text-secondary)" />
                    <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search users..."
    className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
  />
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-(--text-secondary)">
                                <th className="pb-3">User</th>
                                <th className="pb-3">Phone</th>
                                <th className="pb-3">Driver Info</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Orders</th>
                                <th className="pb-3">Total Spent</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <AnimatePresence>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user, index) => <motion.tr
    key={user._id}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2 }}
    whileHover={{ scale: 1.005 }}
    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
  >
                                        <td className="py-4">
                                            <div className="font-semibold text-(--text-primary)">{user.name}</div>
                                            <div className="text-xs text-(--text-secondary)">{user.email}</div>
                                        </td>
                                          <td className="py-4 text-(--text-secondary)">{user.phone || "-"}</td>
                                          <td className="py-4 text-(--text-secondary)">
                                              {user.role === "driver" ? `${user.driverProfile?.vehicleType || "-"} / ${user.driverProfile?.plateNumber || "-"}` : "-"}
                                          </td>
                                          <td className="py-4 text-(--text-secondary)">
                                              {user.role === "admin" ? "Admin" : user.role === "driver" ? "Driver" : "Customer"}
                                          </td>
                                          <td className="py-4 text-(--text-secondary)">{user.stats?.totalOrders || 0}</td>
                                          <td className="py-4 text-(--text-secondary)">${user.stats?.totalSpent?.toFixed(2) || "0.00"}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? "bg-secondary/20 text-secondary" : "bg-danger/20 text-danger"}`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
    onClick={() => handleToggleBan(user)}
    disabled={updatingUserId === user._id}
    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${user.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"} disabled:opacity-60`}
  >
                                                {updatingUserId === user._id ? "Updating..." : user.isActive ? "Ban User" : "Unban User"}
                                            </button>
                                        </td>
                                    </motion.tr>)}
                            </tbody>
                        </AnimatePresence>
                    </table>
                </div>
            </div>
        </div>;
};
export default UsersPage;
