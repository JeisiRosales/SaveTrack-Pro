import { useMemo } from 'react';
import { useExpenseTransactions } from '@/features/expense/hooks/useExpenseTransactions';
import { useGlobalSettings } from '@/context/SettingsContext';

export const useExpensesData = () => {
    const { transactions } = useExpenseTransactions();
    const { currencySymbol } = useGlobalSettings();

    // Utilizamos useMemo para evitar recalcular esto en cada renderizado si 'transactions' no cambia
    const data = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Ordenar por fecha descendente
        const sortedExpenses = [...transactions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const monthlyExpenses = sortedExpenses.filter(t => {
            const txDate = new Date(t.created_at);
            return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });

        // Mostrar todos si no hay del mes
        const displayExpenses = monthlyExpenses.length > 0 ? monthlyExpenses : sortedExpenses;

        // Calcular montos
        const totalMonthlyExpenses = monthlyExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
        const averageWeeklyExpenses = totalMonthlyExpenses / 4;

        // Formatear para tablas
        const formattedFixed = displayExpenses.filter(t =>
            t.expense_categories?.name?.toLowerCase().includes('fijo') ||
            t.expense_categories?.name?.toLowerCase().includes('suscripciones')
        ).map((t: any) => ({
            ...t,
            universalType: 'expense',
            isPositive: false,
            entityName: t.description || t.expense_categories?.name || 'Gasto Fijo',
            categoryName: t.expense_categories?.name || 'Fijo'
        }));

        const formattedVariables = displayExpenses.filter(t =>
            !t.expense_categories?.name?.toLowerCase().includes('fijo') &&
            !t.expense_categories?.name?.toLowerCase().includes('suscripciones')
        ).map((t: any) => ({
            ...t,
            universalType: 'expense',
            isPositive: false,
            entityName: t.description || t.expense_categories?.name || 'Gasto Variable',
            categoryName: t.expense_categories?.name || 'Variable'
        }));

        return {
            totalMonthlyExpenses,
            averageWeeklyExpenses,
            formattedFixed,
            formattedVariables
        };
    }, [transactions]);

    return {
        ...data,
        currencySymbol
    };
};