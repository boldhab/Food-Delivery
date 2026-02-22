import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" />
        </BrowserRouter>
    );
}

export default App;
