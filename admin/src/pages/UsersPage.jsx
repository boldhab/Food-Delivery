import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import adminUserService from '../services/adminUserService';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await adminUserService.getUsers();
                setUsers(response?.data?.users || []);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Track and manage your customer base.</p>
                </div>
            </div>

            <div className="rounded-2xl bg-[var(--surface)] border border-slate-100 shadow-sm p-4 md:p-6">
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-3 text-[var(--text-secondary)]" />
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
                            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                                <th className="pb-3">User</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Orders</th>
                                <th className="pb-3">Total Spent</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <AnimatePresence>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.005 }}
                                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                                    >
                                        <td className="py-4">
                                            <div className="font-semibold text-[var(--text-primary)]">{user.name}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                                        </td>
                                        <td className="py-4 text-[var(--text-secondary)]">{user.role}</td>
                                        <td className="py-4 text-[var(--text-secondary)]">{user.stats?.totalOrders || 0}</td>
                                        <td className="py-4 text-[var(--text-secondary)]">${user.stats?.totalSpent?.toFixed(2) || '0.00'}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                user.isActive ? 'bg-secondary/20 text-secondary' : 'bg-danger/20 text-danger'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </AnimatePresence>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
