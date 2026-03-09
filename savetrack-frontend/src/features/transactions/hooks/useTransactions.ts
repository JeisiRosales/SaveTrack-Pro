import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as transactionsApi from '../api/transactions.api';
import { getExpenseTransactions } from '@/features/expense/api/expense-transactions.api';
import { getIncomeTransactions } from '@/features/income/api/income-transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Account } from '@/features/accounts/types';

// Definición del tipo de rango de tiempo
export type TimeRange = 'today' | 'yesterday' | 'week' | 'biweekly' | 'month' | 'last_month' | 'year' | 'all';

export const useTransactions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'deposit' | 'withdrawal' | 'expense' | 'income'>('All');
    const [accountFilter, setAccountFilter] = useState<string>('All');
    const [timeRange, setTimeRange] = useState<TimeRange>('all');

    const {
        data,
        isLoading: loading,
        refetch: refresh
    } = useQuery({
        queryKey: ['transactions-data'],
        queryFn: async () => {
            const [transRes, expRes, incRes, accRes] = await Promise.all([
                transactionsApi.getTransactions(),
                getExpenseTransactions(),
                getIncomeTransactions(),
                getAccounts()
            ]);

            const rawGoals = Array.isArray(transRes.data) ? transRes.data : [];
            const rawExp = Array.isArray(expRes.data) ? expRes.data : [];
            const rawInc = Array.isArray(incRes.data) ? incRes.data : [];

            const mappedGoals = rawGoals.map((t: any) => ({
                ...t,
                universalType: t.type === 'deposit' ? 'goal_deposit' : 'goal_withdrawal',
                entityName: t.savings_goals?.name || 'Ahorro General',
                isPositive: t.type === 'withdrawal'
            }));

            const mappedExpenses = rawExp.map((e: any) => ({
                ...e,
                type: 'expense',
                universalType: 'expense',
                entityName: e.description || e.expense_categories?.name || 'Gasto General',
                categoryName: e.expense_categories?.name || 'Gasto',
                isPositive: false
            }));

            const mappedIncomes = rawInc.map((i: any) => ({
                ...i,
                type: 'income',
                universalType: 'income',
                entityName: i.description || i.income_categories?.name || 'Ingreso General',
                categoryName: i.income_categories?.name || 'Ingreso',
                isPositive: true
            }));

            const allTransactions = [...mappedGoals, ...mappedExpenses, ...mappedIncomes].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            return {
                transactions: allTransactions,
                accounts: (Array.isArray(accRes.data) ? accRes.data : []) as Account[]
            };
        }
    });

    const transactions = data?.transactions || [];
    const accounts = data?.accounts || [];

    const filteredTransactions = useMemo(() => {
        const now = new Date();

        return transactions.filter((t: any) => {
            // Filtro de Búsqueda
            const matchesSearch = t.entityName.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro de Tipo
            let matchesType = true;
            if (typeFilter !== 'All') {
                matchesType = t.type === typeFilter;
            }

            // Filtro de Cuenta
            const matchesAccount = accountFilter === 'All' || t.account_id === accountFilter;

            // Filtro de Rango de Tiempo (Lógica nueva)
            const txDate = new Date(t.created_at);
            let matchesTime = true;

            switch (timeRange) {
                case 'today':
                    matchesTime = txDate.toDateString() === now.toDateString();
                    break;
                case 'yesterday':
                    const yesterday = new Date();
                    yesterday.setDate(now.getDate() - 1);
                    matchesTime = txDate.toDateString() === yesterday.toDateString();
                    break;
                case 'week':
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    matchesTime = txDate >= startOfWeek;
                    break;
                case 'biweekly': {
                    const startOfBiweekly = new Date(now);
                    startOfBiweekly.setDate(now.getDate() - now.getDate() % 15);
                    startOfBiweekly.setHours(0, 0, 0, 0);
                    return txDate >= startOfBiweekly;
                }
                case 'month':
                    matchesTime = txDate.getMonth() === now.getMonth() &&
                        txDate.getFullYear() === now.getFullYear();
                    break;
                case 'last_month':
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    matchesTime = txDate.getMonth() === lastMonth.getMonth() &&
                        txDate.getFullYear() === lastMonth.getFullYear();
                    break;
                case 'year': {
                    const startOfYear = new Date(now.getFullYear(), 0, 1);
                    startOfYear.setHours(0, 0, 0, 0);
                    return txDate >= startOfYear;
                }
                case 'all':
                default:
                    matchesTime = true;
            }

            return matchesSearch && matchesType && matchesAccount && matchesTime;
        });
    }, [transactions, searchTerm, typeFilter, accountFilter, timeRange]);

    // Estadísticas dinámicas basadas en los filtros aplicados
    const stats = useMemo(() => {
        const incomes = filteredTransactions
            .filter((t: any) =>
                t.isPositive &&
                t.universalType !== 'goal_withdrawal' &&
                t.universalType !== 'goal_deposit'
            )
            .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

        const expenses = filteredTransactions
            .filter((t: any) =>
                !t.isPositive &&
                t.universalType !== 'goal_deposit' &&
                t.universalType !== 'goal_withdrawal'
            )
            .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

        return {
            totalIncomes: incomes,
            totalExpenses: expenses,
            netBalance: incomes - expenses
        };
    }, [filteredTransactions]);

    return {
        transactions: filteredTransactions,
        allAccounts: accounts,
        loading,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        accountFilter,
        setAccountFilter,
        timeRange,
        setTimeRange,
        stats,
        exportToCSV: () => { },
        refresh
    };
};