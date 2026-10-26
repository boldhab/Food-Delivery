import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './shared/context/ThemeContext';

const ClientPortal = lazy(() => import('./portals/client/ClientPortal'));
const AdminPortal = lazy(() => import('./portals/admin/AdminPortal'));
const DriverPortal = lazy(() => import('./portals/driver/DriverPortal'));

const AppLoadingFallback = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[var(--background)] text-[var(--foreground)]">
        <img 
            src="/LOGO.png" 
            alt="Food Hub" 
            className="w-16 h-16 object-contain animate-pulse"
        />
        <div className="w-8 h-8 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
    </div>
);

function App() {
    return (
        <ThemeProvider>
            <Suspense fallback={<AppLoadingFallback />}>
                <Routes>
                    {/* Delivery Driver Portal */}
                    <Route path="/driver/*" element={<DriverPortal />} />

                    {/* Admin Management Dashboard */}
                    <Route path="/admin/*" element={<AdminPortal />} />

                    {/* Customer Storefront (Default) */}
                    <Route path="/*" element={<ClientPortal />} />
                </Routes>
            </Suspense>
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'theme-toast',
                    style: {
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--elevation-2)',
                        borderRadius: '14px',
                        fontSize: '13px',
                        fontWeight: '600'
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--primary)',
                            secondary: '#ffffff'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--color-danger)',
                            secondary: '#ffffff'
                        }
                    }
                }}
            />
        </ThemeProvider>
    );
}

export default App;
