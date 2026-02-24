import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppProvider from './app/AppProvider';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <Layout>
                    <AppRoutes />
                </Layout>
                <Toaster position="top-right" />
            </AppProvider>
        </BrowserRouter>
    );
}

export default App;
