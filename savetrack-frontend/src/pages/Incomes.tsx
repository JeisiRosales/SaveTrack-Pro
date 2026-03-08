import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useIncomesData } from '@/features/income/hooks/UseIncomeData';
import { IncomesView } from '@/features/income/components/IncomeView';
import { CreateIncomeModal } from '@/features/income-transactions/components/CreateIncomeModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

export const Incomes: React.FC = () => {
    const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const incomesData = useIncomesData();

    return (
        <>
            <IncomesView
                data={incomesData}
                onOpenModal={() => setIsCreateModalOpen(true)}
                onToggleSidebar={toggleSidebar}
            />

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateIncomeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};