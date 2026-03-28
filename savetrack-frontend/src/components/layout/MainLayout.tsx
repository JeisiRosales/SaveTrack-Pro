import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UpdateNotificationModal } from '@/features/user-settings/components/UpdateNotificationModal';

// MainLayout
const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 overflow-x-hidden">
            <UpdateNotificationModal />
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <Outlet context={{ toggleSidebar }} />
            </div>
        </div>
    );
};

export default MainLayout;
