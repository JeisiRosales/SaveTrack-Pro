import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFixedExpenses } from '@/features/fixed-expense/hooks/useFixedExpenses';
import { FixedExpenseView } from '@/features/fixed-expense/components/FixedExpenseView';
import { CreateFixedExpenseModal } from '@/features/fixed-expense/components/CreateFixedExpenseModal';

const FixedExpenses: React.FC = () => {
    const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<any | null>(null);

    const { fixedExpenses, summary, currencySymbol, isLoading, error, refresh, handleDelete } = useFixedExpenses();

    const handleEdit = (expense: any) => {
        setExpenseToEdit(expense);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setExpenseToEdit(null);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-[var(--foreground)] p-6">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 max-w-md text-center">
                    <p className="font-bold text-lg mb-2">Error al cargar datos</p>
                    <p className="text-sm opacity-80 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <FixedExpenseView
                expenses={fixedExpenses}
                summary={summary}
                currencySymbol={currencySymbol}
                onToggleSidebar={toggleSidebar}
                onAddExpense={() => setIsCreateModalOpen(true)}
                onEditExpense={handleEdit}
                onDeleteExpense={handleDelete}
            />

            <CreateFixedExpenseModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSuccess={refresh}
                expenseToEdit={expenseToEdit}
            />
        </>
    );
};

export default FixedExpenses;
