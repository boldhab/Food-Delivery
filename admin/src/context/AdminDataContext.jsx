/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';

const AdminDataContext = createContext();

export const useAdminDataContext = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminDataContext must be used within AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider = ({ children }) => {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    const updateStats = (newStats) => setStats(newStats);
    const updateOrders = (newOrders) => setOrders(newOrders);
    const updateFoods = (newFoods) => setFoods(newFoods);
    const updateUsers = (newUsers) => setUsers(newUsers);
    const updateFilters = (newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }));

    const value = {
        stats,
        orders,
        foods,
        users,
        loading,
        filters,
        updateStats,
        updateOrders,
        updateFoods,
        updateUsers,
        updateFilters,
        setLoading
    };

    return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export default AdminDataContext;

