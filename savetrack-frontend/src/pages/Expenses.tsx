import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useExpensesData } from '@/features/expense/hooks/useExpenseData';
import { ExpensesView } from '@/features/expense/components/ExpenseView';
import { CreateExpenseModal } from '@/features/expense/components/CreateExpenseModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

export const Expenses: React.FC = () => {
    const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Obtenemos los datos ya procesados
    const expensesData = useExpensesData();

    return (
        <>
            <ExpensesView
                data={expensesData}
                onOpenModal={() => setIsCreateModalOpen(true)}
                onToggleSidebar={toggleSidebar}
            />

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateExpenseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};