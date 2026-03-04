import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { GoalDetailView } from '../features/goals';

// pagina de detalle de meta
const GoalDetailsPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <GoalDetailView onSidebarOpen={() => setIsSidebarOpen(true)} />
        </div>
    );
};

export default GoalDetailsPage;