import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useIncomeData } from '@/features/income/hooks/UseIncomeData';
import { useIncomeTransactions } from '@/features/income/hooks/useIncomeTransactions';
import { IncomesView } from '@/features/income/components/IncomeView';
import { CreateIncomeModal } from '@/features/income/components/CreateIncomeModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

export const Incomes: React.FC = () => {
    const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const incomeData = useIncomeData();
    const { remove, isRemoving, removingId } = useIncomeTransactions();

    return (
        <>
            <IncomesView
                data={incomeData}
                onOpenModal={() => setIsCreateModalOpen(true)}
                onToggleSidebar={toggleSidebar}
                onRemove={remove}
                isRemoving={isRemoving}
                removingId={removingId}
                onConfirmingChange={setIsConfirmingDelete}
            />

            {!isConfirmingDelete && (
                <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />
            )}

            <CreateIncomeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};