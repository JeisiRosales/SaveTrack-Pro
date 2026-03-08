import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as transactionsApi from '../api/transactions.api';
import { getExpenseTransactions } from '@/features/expense/api/expense-transactions.api';
import { getIncomeTransactions } from '@/features/income-transactions/api/income-transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Account } from '@/features/accounts/types';

export const useTransactions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'deposit' | 'withdrawal' | 'expense' | 'income'>('All');
    const [accountFilter, setAccountFilter] = useState<string>('All');

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

            // Normalizando Objetos para una Vista Universal
            const rawGoals = Array.isArray(transRes.data) ? transRes.data : [];
            const rawExp = Array.isArray(expRes.data) ? expRes.data : [];
            const rawInc = Array.isArray(incRes.data) ? incRes.data : [];

            const mappedGoals = rawGoals.map((t: any) => ({
                ...t,
                universalType: t.type === 'deposit' ? 'goal_deposit' : 'goal_withdrawal',
                entityName: t.savings_goals?.name || 'Ahorro General',
                isPositive: t.type === 'withdrawal' // Un retiro de meta SUMA a la cuenta, un depósito de meta RESTA de la cuenta.
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

            // Combinar y Ordenar Descendentemente (Más recientes primero)
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
        return transactions.filter((t: any) => {
            const matchesSearch = t.entityName.toLowerCase().includes(searchTerm.toLowerCase());

            // Lógica de Filtro compleja
            let matchesType = true;
            if (typeFilter !== 'All') {
                if (typeFilter === 'deposit') matchesType = t.type === 'deposit';
                if (typeFilter === 'withdrawal') matchesType = t.type === 'withdrawal';
                if (typeFilter === 'expense') matchesType = t.type === 'expense';
                if (typeFilter === 'income') matchesType = t.type === 'income';
            }

            const matchesAccount = accountFilter === 'All' || t.account_id === accountFilter;

            return matchesSearch && matchesType && matchesAccount;
        });
    }, [transactions, searchTerm, typeFilter, accountFilter]);

    // Calcula estadísticas de transacciones (usando los signos `isPositive`)
    const stats = useMemo(() => {
        const incomes = filteredTransactions
            .filter((t: any) => t.isPositive)
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const expenses = filteredTransactions
            .filter((t: any) => !t.isPositive)
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

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
        stats,
        exportToCSV: () => { }, // TODO opcional: Actualizar CSV
        refresh
    };
};
