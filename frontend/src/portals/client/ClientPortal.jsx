import React from 'react';
import AppProvider from './app/AppProvider';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function ClientPortal() {
    return (
        <ThemeProvider>
            <AppProvider>
                <Layout>
                    <AppRoutes />
                </Layout>
            </AppProvider>
        </ThemeProvider>
    );
}

export default ClientPortal;
