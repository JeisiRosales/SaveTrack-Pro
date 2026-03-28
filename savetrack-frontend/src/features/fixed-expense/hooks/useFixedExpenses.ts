import { useState, useEffect, useCallback } from 'react';
import { FixedExpense, FixedExpenseSummary } from '../types';
import { getFixedExpenses, getFixedExpensesSummary, deleteFixedExpense } from '../api/fixed.api';
import { useGlobalSettings } from '@/context/SettingsContext';

export const useFixedExpenses = () => {
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [summary, setSummary] = useState<FixedExpenseSummary>({
        totalMonthly: 0,
        paidThisMonth: 0,
        pendingThisMonth: 0,
        count: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currencySymbol } = useGlobalSettings();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                getFixedExpenses(),
                getFixedExpensesSummary()
            ]);
            setFixedExpenses(expensesRes.data);
            setSummary(summaryRes.data);
        } catch (err: any) {
            console.error('[useFixedExpenses] Error:', err);
            setError(err.response?.data?.message || 'Error al cargar los gastos fijos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteFixedExpense(id);
            await fetchData(); // Recargar datos tras eliminar
        } catch (err) {
            console.error('[useFixedExpenses] Error al eliminar:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        fixedExpenses,
        summary,
        currencySymbol,
        isLoading,
        error,
        refresh: fetchData,
        handleDelete
    };
};
