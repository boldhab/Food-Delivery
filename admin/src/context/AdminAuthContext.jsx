/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import adminApi from '../services/adminApi';

export const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const response = await adminApi.get('/auth/profile');
                if (response.data.success && response.data.data.role === 'admin') {
                    setUser(response.data.data);
                    setIsAuthenticated(true);
                } else {
                    logout();
                }
            } catch {
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const response = await adminApi.post('/auth/login', { email, password });

            if (response.data.success) {
                const { token, ...userData } = response.data.data;

                if (userData.role !== 'admin') {
                    throw new Error('Unauthorized: Admin access only');
                }

                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminUser', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true };
            }

            return { success: false, message: 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

