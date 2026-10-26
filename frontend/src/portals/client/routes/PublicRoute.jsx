import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/ui/Loader';

const PublicRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (isAuthenticated) {
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        if (user?.role === 'driver') {
            return <Navigate to="/driver/available" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
