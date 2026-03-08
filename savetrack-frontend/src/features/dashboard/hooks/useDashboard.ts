import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboard.api';
import { Account, Goal, Transaction } from '../types';
import { getIncomeTransactions } from '@/features/income/api/income-transactions.api';
import { getExpenseTransactions } from '@/features/expense/api/expense-transactions.api';

export const useDashboard = () => {
    const { data, isLoading: loading, error: queryError, refetch: refresh } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const [accRes, goalRes, txRes, incRes, expRes] = await Promise.allSettled([
                getDashboardSummary().then(r => r[0]),
                getDashboardSummary().then(r => r[1]),
                getDashboardSummary().then(r => r[2]),
                getIncomeTransactions(),
                getExpenseTransactions(),
            ]);

            const accounts = accRes.status === 'fulfilled' ? (accRes.value as any)?.value?.data ?? [] : [];
            const goals = goalRes.status === 'fulfilled' ? (goalRes.value as any)?.value?.data ?? [] : [];
            const transactions = txRes.status === 'fulfilled' ? (txRes.value as any)?.value?.data ?? [] : [];
            const incomes = incRes.status === 'fulfilled' ? (incRes.value as any).data ?? [] : [];
            const expenses = expRes.status === 'fulfilled' ? (expRes.value as any).data ?? [] : [];

            return { accounts, goals, transactions, incomes, expenses };
        }
    });

    const accounts = (data?.accounts || []) as Account[];
    const goals = (data?.goals || []) as Goal[];
    const transactions = (data?.transactions || []) as Transaction[];
    const incomes = (data?.incomes || []) as any[];
    const expenses = (data?.expenses || []) as any[];

    // ── Métricas globales ────────────────────────────────────────────────
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalSavedInGoals = goals.reduce((s, g) => s + (g.current_amount || 0), 0);

    // ── Métricas del mes actual ──────────────────────────────────────────
    const now = new Date();
    const isThisMonth = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const monthlyIncome = incomes
        .filter(t => isThisMonth(t.created_at))
        .reduce((s, t) => s + Number(t.amount), 0);

    const monthlyExpense = expenses
        .filter(t => isThisMonth(t.created_at))
        .reduce((s, t) => s + Number(t.amount), 0);

    const monthlySavings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0
        ? Math.round((monthlySavings / monthlyIncome) * 100)
        : 0;

    // ── Últimas 5 transacciones mezcladas ───────────────────────────────
    const recentActivity = [
        ...incomes.map((t: any) => ({
            ...t,
            universalType: 'income',
            isPositive: true,
            entityName: t.description || t.income_categories?.name || 'Ingreso',
        })),
        ...expenses.map((t: any) => ({
            ...t,
            universalType: 'expense',
            isPositive: false,
            entityName: t.description || t.expense_categories?.name || 'Gasto',
        })),
        ...transactions.map((t: any) => ({
            ...t,
            universalType: t.type,
            isPositive: t.type === 'withdrawal',
            entityName: t.savings_goals?.name || t.funding_accounts?.name || 'Movimiento',
        })),
    ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

    // ── Serie semanal para mini gráfica (últimas 6 semanas) ─────────────
    const weeklyData = Array.from({ length: 6 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - (5 - i) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const label = `S${i + 1}`;
        const inc = incomes
            .filter(t => { const d = new Date(t.created_at); return d >= weekStart && d < weekEnd; })
            .reduce((s, t) => s + Number(t.amount), 0);
        const exp = expenses
            .filter(t => { const d = new Date(t.created_at); return d >= weekStart && d < weekEnd; })
            .reduce((s, t) => s + Number(t.amount), 0);

        return { label, income: inc, expense: exp };
    });

    return {
        loading,
        error: queryError ? 'No se pudo sincronizar la información.' : null,
        accounts,
        goals,
        transactions,
        recentActivity,
        totalBalance,
        totalSavedInGoals,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        savingsRate,
        weeklyData,
        refresh,
    };
};