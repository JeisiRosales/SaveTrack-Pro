import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useExpenseData } from '@/features/expense/hooks/useExpenseData';
import { useExpenseTransactions } from '@/features/expense/hooks/useExpenseTransactions';
import { ExpensesView } from '@/features/expense/components/ExpenseView';
import { CreateExpenseModal } from '@/features/expense/components/CreateExpenseModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

export const Expenses: React.FC = () => {
    const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const expensesData = useExpenseData();
    const { remove, isRemoving, removingId } = useExpenseTransactions();

    return (
        <>
            <ExpensesView
                data={expensesData}
                onOpenModal={() => setIsCreateModalOpen(true)}
                onToggleSidebar={toggleSidebar}
                onRemove={remove}
                isRemoving={isRemoving}
                removingId={removingId}
            />

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateExpenseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};