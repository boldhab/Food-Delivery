import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            {/* Main Content Area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300">
                {/* Header */}
                <Header toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} isSidebarCollapsed={sidebarCollapsed} />

                {/* Content Wrapper */}
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
