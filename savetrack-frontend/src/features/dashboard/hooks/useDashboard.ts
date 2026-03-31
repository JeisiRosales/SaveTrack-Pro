import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboard.api';
import { Account, Goal, Transaction } from '../types';
import { getIncomeTransactions } from '@/features/income/api/income-transactions.api';
import { getExpenseTransactions } from '@/features/expense/api/expense-transactions.api';
import { getFixedExpenses, getFixedExpensesSummary } from '@/features/fixed-expense/api/fixed.api';
import { FixedExpense, FixedExpenseSummary } from '@/features/fixed-expense/types';

import { useGlobalSettings } from '@/context/SettingsContext';
import { BudgetPeriod } from '@/features/goals/utils/goal-calculations';

export const useDashboard = () => {
    const { budgetPeriod } = useGlobalSettings();

    const { data, isLoading: loading, error: queryError, refetch: refresh } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const [accRes, goalRes, txRes, incRes, expRes, fixedRes, fixedSumRes] = await Promise.allSettled([
                getDashboardSummary().then(r => r[0]),
                getDashboardSummary().then(r => r[1]),
                getDashboardSummary().then(r => r[2]),
                getIncomeTransactions(),
                getExpenseTransactions(),
                getFixedExpenses(),
                getFixedExpensesSummary(),
            ]);

            const accounts = accRes.status === 'fulfilled' ? (accRes.value as any)?.value?.data ?? [] : [];
            const goals = goalRes.status === 'fulfilled' ? (goalRes.value as any)?.value?.data ?? [] : [];
            const transactions = txRes.status === 'fulfilled' ? (txRes.value as any)?.value?.data ?? [] : [];
            const incomes = incRes.status === 'fulfilled' ? (incRes.value as any).data ?? [] : [];
            const expenses = expRes.status === 'fulfilled' ? (expRes.value as any).data ?? [] : [];
            const fixedExpenses = fixedRes.status === 'fulfilled' ? (fixedRes.value as any).data ?? [] : [];
            const fixedExpensesSummary = fixedSumRes.status === 'fulfilled' ? (fixedSumRes.value as any).data ?? null : null;

            return { accounts, goals, transactions, incomes, expenses, fixedExpenses, fixedExpensesSummary };
        }
    });

    const accounts = (data?.accounts || []) as Account[];
    const goals = (data?.goals || []) as Goal[];
    const transactions = (data?.transactions || []) as Transaction[];
    const incomes = (data?.incomes || []) as any[];
    const expenses = (data?.expenses || []) as any[];
    const fixedExpenses = (data?.fixedExpenses || []) as FixedExpense[];
    const fixedExpensesSummary = (data?.fixedExpensesSummary || null) as FixedExpenseSummary | null;

    // ── Métricas globales ────────────────────────────────────────────────
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalSavedInGoals = goals.reduce((s, g) => s + (g.current_amount || 0), 0);

    // ── Métricas del período del usuario ─────────────────────────────────
    const now = new Date();

    // Obtiene si una fecha pertenece al período fiscal actual del usuario
    const isInUserPeriod = (dateStr: string, period: BudgetPeriod) => {
        const d = new Date(dateStr);

        switch (period) {
            case 'daily':
                return d.getDate() === now.getDate() &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear();

            case 'weekly': {
                // Semana de lunes a domingo
                const currentDay = now.getDay() || 7; // 1-7 (Lun-Dom)
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - currentDay + 1);
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                return d.getTime() >= weekStart.getTime() && d.getTime() <= weekEnd.getTime();
            }
            case 'biweekly': {
                if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
                const isFirstHalfNow = now.getDate() <= 15;
                const isFirstHalfD = d.getDate() <= 15;
                return isFirstHalfNow === isFirstHalfD;
            }
            case 'yearly':
                return d.getFullYear() === now.getFullYear();

            case 'monthly':
            default:
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
    };

    const monthlyIncome = incomes
        .filter(t => isInUserPeriod(t.created_at, budgetPeriod))
        .reduce((s, t) => s + Number(t.amount), 0);

    const monthlyExpense = expenses
        .filter(t => isInUserPeriod(t.created_at, budgetPeriod))
        .reduce((s, t) => s + Number(t.amount), 0);

    const monthlySavings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0
        ? Math.round((monthlySavings / monthlyIncome) * 100)
        : 0;

    const currentDay = now.getDate();

    // El gasto más cercano a pagar en este mes (entre los pendientes):
    // Buscamos aquellos cuyo billing_day sea mayor o igual al día actual.
    // Si no hay ninguno, quizás ya todos pasaron (o faltan por pagar del mes anterior) pero nos enfocamos en el próximo inminente.
    const pendingFixed = fixedExpenses.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL' || f.status === 'OVERDUE');

    // Ordenamos por día de cobro
    pendingFixed.sort((a, b) => a.billing_day - b.billing_day);

    // Primero priorizamos los atrasados, si hay alguno, ese es el más urgente
    let nextFixedExpense = pendingFixed.find(f => f.status === 'OVERDUE');

    // Si no hay atrasos, buscamos el primero que sea >= al día actual (próximo a vencer este mes)
    if (!nextFixedExpense) {
        nextFixedExpense = pendingFixed.find(f => f.billing_day >= currentDay);
    } else {
        nextFixedExpense.remainingAmount = nextFixedExpense.amount - (nextFixedExpense.paidAmount || 0);
    }

    // Si no encontramos, tomamos el primer pendiente que haya quedado rezagado
    if (!nextFixedExpense && pendingFixed.length > 0) {
        nextFixedExpense = pendingFixed[0];
    }

    // Breakdown states
    const statusCounts = {
        PAID: fixedExpenses.filter(f => f.status === 'PAID').length,
        PENDING: fixedExpenses.filter(f => f.status === 'PENDING').length,
        PARTIAL: fixedExpenses.filter(f => f.status === 'PARTIAL').length,
        OVERDUE: fixedExpenses.filter(f => f.status === 'OVERDUE').length,
    };

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
        fixedExpenses,
        fixedExpensesSummary,
        nextFixedExpense,
        statusCounts,
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