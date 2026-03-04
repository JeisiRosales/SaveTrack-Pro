import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { GoalsView } from '../features/goals';

// componente para mostrar las metas
const Goals: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <GoalsView onSidebarOpen={() => setIsSidebarOpen(true)} />
        </div>
    );
};

export default Goals;
