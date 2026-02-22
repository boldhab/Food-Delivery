import { useState } from 'react';
import adminOrderService from '../services/adminOrderService';
import adminFoodService from '../services/adminFoodService';
import adminUserService from '../services/adminUserService';

export const useAdminData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [stats, recentOrders] = await Promise.all([
                adminOrderService.getDashboardStats(),
                adminOrderService.getOrders({ limit: 5 })
            ]);
            return { stats: stats.data, recentOrders: recentOrders.data.orders };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminOrderService.getOrders(params);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchFoods = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminFoodService.getFoodsWithStats(params);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminUserService.getUsers(params);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchDashboardData,
        fetchOrders,
        fetchFoods,
        fetchUsers
    };
};
