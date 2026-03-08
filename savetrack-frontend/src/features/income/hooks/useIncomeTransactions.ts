import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getIncomeTransactions,
    createIncomeTransaction,
    deleteIncomeTransaction,
} from '../api/income-transactions.api';
import { IncomeTransaction, CreateIncomeTransactionForm } from '../types';

export const INCOME_TRANSACTIONS_KEY = ['income-transactions'] as const;

export const useIncomeTransactions = () => {
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading: loading } = useQuery({
        queryKey: INCOME_TRANSACTIONS_KEY,
        queryFn: async () => {
            const res = await getIncomeTransactions();
            return res.data as IncomeTransaction[];
        },
    });

    const addMutation = useMutation({
        mutationFn: (data: CreateIncomeTransactionForm) => createIncomeTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INCOME_TRANSACTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });

    const removeMutation = useMutation<void, Error, string, { previous: IncomeTransaction[] | undefined }>({
        mutationFn: async (id: string) => { await deleteIncomeTransaction(id); },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: INCOME_TRANSACTIONS_KEY });
            const previous = queryClient.getQueryData<IncomeTransaction[]>(INCOME_TRANSACTIONS_KEY);
            queryClient.setQueryData<IncomeTransaction[]>(
                INCOME_TRANSACTIONS_KEY,
                old => (old ?? []).filter(t => t.id !== id)
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(INCOME_TRANSACTIONS_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: INCOME_TRANSACTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });

    return {
        transactions,
        loading,
        add: addMutation.mutateAsync,
        remove: removeMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
        removingId: removeMutation.variables,
    };
};