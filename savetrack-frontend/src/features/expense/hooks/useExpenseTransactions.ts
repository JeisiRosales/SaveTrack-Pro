import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getExpenseTransactions,
    createExpenseTransaction,
    deleteExpenseTransaction,
} from '../../expense/api/expense-transactions.api';
import { ExpenseTransaction, CreateExpenseTransactionForm } from '../types';

export const EXPENSE_TRANSACTIONS_KEY = ['expense-transactions'] as const;

export const useExpenseTransactions = () => {
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading: loading } = useQuery({
        queryKey: EXPENSE_TRANSACTIONS_KEY,
        queryFn: async () => {
            const res = await getExpenseTransactions();
            return res.data as ExpenseTransaction[];
        },
    });

    const addMutation = useMutation({
        mutationFn: (data: CreateExpenseTransactionForm) => createExpenseTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EXPENSE_TRANSACTIONS_KEY });
            // Invalida el dashboard para que también se actualice
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        },
    });

    const removeMutation = useMutation<void, Error, string, { previous: ExpenseTransaction[] | undefined }>({
        mutationFn: async (id: string) => { await deleteExpenseTransaction(id); },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: EXPENSE_TRANSACTIONS_KEY });
            const previous = queryClient.getQueryData<ExpenseTransaction[]>(EXPENSE_TRANSACTIONS_KEY);
            queryClient.setQueryData<ExpenseTransaction[]>(
                EXPENSE_TRANSACTIONS_KEY,
                old => (old ?? []).filter(t => t.id !== id)
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(EXPENSE_TRANSACTIONS_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: EXPENSE_TRANSACTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        },
    });

    return {
        transactions,
        loading,
        add: addMutation.mutateAsync,
        remove: removeMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
        removingId: removeMutation.variables, // id que se está eliminando actualmente
    };
};