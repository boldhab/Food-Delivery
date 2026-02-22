import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AppRoutes from './routes';
import './App.css';

function App() {
    return (
        <Router>
            <AdminAuthProvider>
                <AdminDataProvider>
                    <AppRoutes />
                </AdminDataProvider>
            </AdminAuthProvider>
        </Router>
    );
}

export default App;
