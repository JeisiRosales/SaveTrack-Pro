import { useMemo, useState } from 'react';
import { useExpenseTransactions } from '@/features/expense/hooks/useExpenseTransactions';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';
import { useGlobalSettings } from '@/context/SettingsContext';

export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'all';

export interface DailyExpense {
    day: number;
    month: number;
    label: string; // "24/2" para el eje X
    total: number;
    [key: string]: number | string;
}

export interface CategoryExpense {
    name: string;
    value: number;
    percentage: number;
    isFixed: boolean;
    [key: string]: string | number | boolean;
}

export const useExpenseData = () => {
    const { transactions } = useExpenseTransactions();
    const { categories } = useExpenseCategories();
    const { currencySymbol } = useGlobalSettings();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const data = useMemo(() => {
        const now = new Date();
        const categoryMap = new Map(categories.map(c => [c.id, c]));

        // ── Filtro por timeRange ──────────────────────────────────────────
        const filtered = transactions.filter(t => {
            const txDate = new Date(t.created_at);
            switch (timeRange) {
                case 'today':
                    return txDate.toDateString() === now.toDateString();
                case 'yesterday': {
                    const yesterday = new Date();
                    yesterday.setDate(now.getDate() - 1);
                    return txDate.toDateString() === yesterday.toDateString();
                }
                case 'week': {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    return txDate >= startOfWeek;
                }
                case 'month':
                    return txDate.getMonth() === now.getMonth() &&
                        txDate.getFullYear() === now.getFullYear();
                case 'last_month': {
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return txDate.getMonth() === lastMonth.getMonth() &&
                        txDate.getFullYear() === lastMonth.getFullYear();
                }
                case 'all':
                default:
                    return true;
            }
        });

        const sorted = [...filtered].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // ── Métricas ─────────────────────────────────────────────────────
        const totalMonthlyExpenses = sorted.reduce((acc, t) => acc + Number(t.amount), 0);
        const averageWeeklyExpenses = totalMonthlyExpenses / 4;

        // ── Helpers para determinar si un gasto es fijo ───────────────────
        const isFixed = (t: any): boolean => {
            // Primero intentamos por la categoría del mapa (tiene is_fixed)
            if (t.category_id) {
                const cat = categoryMap.get(t.category_id);
                if (cat) return cat.is_fixed;
            }
            // Fallback: nombre de categoría joined desde la DB
            const catName = t.expense_categories?.name?.toLowerCase() ?? '';
            return catName.includes('fijo') || catName.includes('suscripc');
        };

        const getCategoryName = (t: any): string =>
            t.expense_categories?.name ||
            (t.category_id ? categoryMap.get(t.category_id)?.name : undefined) ||
            'General';

        // ── Transacciones formateadas separadas por tipo ──────────────────
        const formattedAll = sorted.map((t: any) => ({
            ...t,
            universalType: 'expense',
            isPositive: false,
            entityName: t.description || t.expense_categories?.name || 'Gasto',
            categoryName: getCategoryName(t),
            _isFixed: isFixed(t),
        }));

        const formattedFixed = formattedAll.filter(t => t._isFixed);
        const formattedVariables = formattedAll.filter(t => !t._isFixed);

        // ── Gráfica de área: ingreso por día según timeRange ─────────────
        const dailyMap = new Map<string, { day: number; month: number; amount: number }>();
        filtered.forEach(t => {
            const date = new Date(t.created_at);
            const key = date.toISOString().slice(0, 10);
            const existing = dailyMap.get(key);
            dailyMap.set(key, {
                day: date.getDate(),
                month: date.getMonth() + 1,
                amount: (existing?.amount ?? 0) + Number(t.amount),
            });
        });

        const dailyChartData: DailyExpense[] = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, { day, month, amount }]) => ({
                day, month,
                label: `${day}/${month}`,
                total: amount,
            }));

        // ── Gráfica de dona: por categoría (respeta timeRange) ────────────
        const categoryTotals = new Map<string, { value: number; isFixed: boolean }>();
        sorted.forEach(t => {
            const catName = getCategoryName(t);
            const fixed = isFixed(t);
            const existing = categoryTotals.get(catName);
            categoryTotals.set(catName, {
                value: (existing?.value ?? 0) + Number(t.amount),
                isFixed: fixed,
            });
        });

        const categoryChartData: CategoryExpense[] = Array.from(categoryTotals.entries()).map(
            ([name, { value, isFixed: fixed }]) => ({
                name,
                value,
                isFixed: fixed,
                percentage: totalMonthlyExpenses > 0
                    ? Math.round((value / totalMonthlyExpenses) * 1000) / 10
                    : 0,
            })
        );

        // ── Totales fijos vs variables ────────────────────────────────────
        const totalFixed = formattedFixed.reduce((acc, t) => acc + Number(t.amount), 0);
        const totalVariable = formattedVariables.reduce((acc, t) => acc + Number(t.amount), 0);

        return {
            totalMonthlyExpenses,
            averageWeeklyExpenses,
            totalFixed,
            totalVariable,
            currencySymbol,
            formattedFixed,
            formattedVariables,
            dailyChartData,
            categoryChartData,
        };
    }, [transactions, categories, currencySymbol, timeRange]);

    return { ...data, timeRange, setTimeRange };
};