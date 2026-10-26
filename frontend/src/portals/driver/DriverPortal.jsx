import React from 'react';
import { DriverAuthProvider } from './context/DriverAuthContext';
import DriverRoutes from './DriverRoutes';
import './styles.css';

function DriverPortal() {
    return (
        <DriverAuthProvider>
            <DriverRoutes />
        </DriverAuthProvider>
    );
}

export default DriverPortal;
