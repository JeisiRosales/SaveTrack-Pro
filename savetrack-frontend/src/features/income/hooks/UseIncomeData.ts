import { useMemo } from 'react';
import { useIncomeTransactions } from '@/features/income-transactions/hooks/useIncomeTransactions';
import { useGlobalSettings } from '@/context/SettingsContext';

export const useIncomesData = () => {
    const { transactions } = useIncomeTransactions();
    const { currencySymbol } = useGlobalSettings();

    const stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const sorted = [...transactions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const monthly = sorted.filter(t => {
            const txDate = new Date(t.created_at);
            return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });

        const displayIncomes = monthly.length > 0 ? monthly : sorted;

        const totalMonthly = monthly.reduce((acc, t) => acc + Number(t.amount), 0);

        const formatted = displayIncomes.map((t: any) => ({
            ...t,
            universalType: 'income',
            isPositive: true,
            entityName: t.description || t.income_categories?.name || 'Ingreso',
            categoryName: t.income_categories?.name || 'General'
        }));

        return {
            totalMonthlyIncome: totalMonthly,
            averageWeeklyIncome: totalMonthly / 4,
            formattedTransactions: formatted
        };
    }, [transactions]);

    return { ...stats, currencySymbol };
};