import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboard.api';
import { Account, Goal, Transaction } from '../types';

// Hook para obtener el resumen del dashboard con React Query
export const useDashboard = () => {
    const {
        data,
        isLoading: loading,
        error: queryError,
        refetch: refresh
    } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const [accRes, goalRes, txRes] = await getDashboardSummary();

            if (accRes.status === 'rejected' || goalRes.status === 'rejected') {
                throw new Error("Error al cargar datos esenciales.");
            }

            return {
                accounts: accRes.value.data as Account[],
                goals: goalRes.value.data as Goal[],
                transactions: txRes.status === 'fulfilled' ? (txRes.value.data as Transaction[]) : []
            };
        }
    });

    const accounts = data?.accounts || [];
    const goals = data?.goals || [];
    const transactions = data?.transactions || [];
    const error = queryError ? "No se pudo sincronizar la información." : null;

    // Calcula el balance total
    const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
    // Calcula el total ahorrado en metas
    const totalSavedInGoals = goals.reduce((acc, curr) => acc + (curr.current_amount || 0), 0);

    return {
        loading,
        error,
        accounts,
        goals,
        transactions,
        totalBalance,
        totalSavedInGoals,
        refresh
    };
};