import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/dashboard.api';
import { Account, Goal, Transaction } from '../types';

// Hook para obtener el resumen del dashboard
export const useDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Hook para obtener el resumen del dashboard
    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, goalRes, txRes] = await getDashboardSummary();

            if (accRes.status === 'fulfilled') setAccounts(accRes.value.data);
            if (goalRes.status === 'fulfilled') setGoals(goalRes.value.data);
            if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);

            if (accRes.status === 'rejected' || goalRes.status === 'rejected') {
                throw new Error("Error al cargar datos esenciales.");
            }
        } catch (err) {
            setError("No se pudo sincronizar la información.");
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener el resumen del dashboard
    useEffect(() => { fetchData(); }, []);

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
        refresh: fetchData
    };
};