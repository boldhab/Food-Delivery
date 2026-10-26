import React from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AppRoutes from './routes';
import './App.css';

function AdminPortal() {
    return (
        <AdminAuthProvider>
            <AdminDataProvider>
                <AppRoutes />
            </AdminDataProvider>
        </AdminAuthProvider>
    );
}

export default AdminPortal;
