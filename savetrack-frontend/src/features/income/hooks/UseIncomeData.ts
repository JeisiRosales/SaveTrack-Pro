import { useMemo, useState } from 'react';
import { useIncomeTransactions } from '@/features/income/hooks/useIncomeTransactions';
import { useIncomeCategories } from '@/features/income/hooks/useIncomeCategories';
import { useGlobalSettings } from '@/context/SettingsContext';

export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'all';

export interface DailyIncome {
    day: number;
    month: number; // 1-12 para mostrar en la leyenda
    label: string; // "24/2" formato para el eje X
    total: number;
    [key: string]: number | string;
}

export interface CategoryIncome {
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}

export const useIncomeData = () => {
    const { transactions } = useIncomeTransactions();
    const { categories } = useIncomeCategories();
    const { currencySymbol } = useGlobalSettings();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const data = useMemo(() => {
        const now = new Date();
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));

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
        const totalMonthlyIncome = sorted.reduce((acc, t) => acc + Number(t.amount), 0);
        const averageWeeklyIncome = totalMonthlyIncome / 4;

        // ── formattedTransactions (compatible con TransactionsTable) ─────
        const formattedTransactions = sorted.map((t: any) => ({
            ...t,
            universalType: 'income',
            isPositive: true,
            entityName: t.description || t.income_categories?.name || 'Ingreso',
            categoryName: t.income_categories?.name
                || (t.category_id ? categoryMap.get(t.category_id) : undefined)
                || 'General',
        }));

        // ── Gráfica de área: acumulado por día según timeRange ───────────
        const dailyMap = new Map<string, { day: number; month: number; amount: number }>();
        filtered.forEach(t => {
            const date = new Date(t.created_at);
            const key = date.toISOString().slice(0, 10); // "2026-02-24"
            const existing = dailyMap.get(key);
            dailyMap.set(key, {
                day: date.getDate(),
                month: date.getMonth() + 1,
                amount: (existing?.amount ?? 0) + Number(t.amount),
            });
        });

        const sortedEntries = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b));

        // Sin acumulado: cada punto muestra solo el ingreso de ese día
        const dailyChartData: DailyIncome[] = sortedEntries.map(([, { day, month, amount }]) => {
            return { day, month, label: `${day}/${month}`, total: amount };
        });

        // ── Gráfica de dona: distribución por categoría (respeta timeRange)
        const categoryTotals = new Map<string, number>();
        sorted.forEach(t => {
            const catName = (t as any).income_categories?.name
                || (t.category_id ? categoryMap.get(t.category_id) : undefined)
                || 'General';
            categoryTotals.set(catName, (categoryTotals.get(catName) ?? 0) + Number(t.amount));
        });

        const categoryChartData: CategoryIncome[] = Array.from(categoryTotals.entries()).map(
            ([name, value]) => ({
                name,
                value,
                percentage: totalMonthlyIncome > 0
                    ? Math.round((value / totalMonthlyIncome) * 1000) / 10
                    : 0,
            })
        );

        return {
            totalMonthlyIncome,
            averageWeeklyIncome,
            currencySymbol,
            formattedTransactions,
            dailyChartData,
            categoryChartData,
        };
    }, [transactions, categories, currencySymbol, timeRange]);

    return { ...data, timeRange, setTimeRange };
};