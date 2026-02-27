import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const parseStoredUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const extractAuthPayload = (responseBody) => {
    const payload = responseBody?.data && typeof responseBody.data === 'object'
        ? responseBody.data
        : responseBody;

    const token = payload?.token || null;
    let user = null;
    if (payload?._id) {
        const { token: _ignoredToken, ...rest } = payload;
        user = rest;
    } else if (payload?.user) {
        user = payload.user;
    }

    return { token, user };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(parseStoredUser);
    const [loading, setLoading] = useState(true);
    const didInitRef = useRef(false);

    const isAuthenticated = Boolean(user && localStorage.getItem(TOKEN_KEY));

    const persistAuth = useCallback((token, nextUser) => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
        if (nextUser) {
            localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
            setUser(nextUser);
        }
    }, []);

    const clearAuth = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setUser(null);
            return null;
        }

        const profileRes = await authService.getProfile();
        const profile = profileRes?.user || profileRes?.data || profileRes;
        if (profile) {
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
            setUser(profile);
        }
        return profile || null;
    }, []);

    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        const init = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                await refreshUser();
            } catch {
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [clearAuth, refreshUser]);

    const login = useCallback(async (credentials) => {
        const res = await authService.login(credentials);
        const { token, user: nextUser } = extractAuthPayload(res);

        persistAuth(token, nextUser);

        if (!nextUser) {
            await refreshUser();
        }

        return res;
    }, [persistAuth, refreshUser]);

    const register = useCallback(async (payload) => {
        const res = await authService.register(payload);
        const { token, user: nextUser } = extractAuthPayload(res);

        persistAuth(token, nextUser);

        if (!nextUser) {
            await refreshUser();
        }

        return res;
    }, [persistAuth, refreshUser]);

    const logout = useCallback(async () => {
        clearAuth();
    }, [clearAuth]);

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
    }), [user, loading, isAuthenticated, login, register, logout, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
