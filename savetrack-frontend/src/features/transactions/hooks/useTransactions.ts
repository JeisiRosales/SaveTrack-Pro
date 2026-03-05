import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as transactionsApi from '../api/transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Transaction } from '../types';
import { Account } from '@/features/accounts/types';

// Hook para obtener transacciones y cuentas con React Query
export const useTransactions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'deposit' | 'withdrawal'>('All');
    const [accountFilter, setAccountFilter] = useState<string>('All');

    const {
        data,
        isLoading: loading,
        refetch: refresh
    } = useQuery({
        queryKey: ['transactions-data'],
        queryFn: async () => {
            const [transRes, accRes] = await Promise.all([
                transactionsApi.getTransactions(),
                getAccounts()
            ]);
            return {
                transactions: (Array.isArray(transRes.data) ? transRes.data : []) as Transaction[],
                accounts: (Array.isArray(accRes.data) ? accRes.data : []) as Account[]
            };
        }
    });

    const transactions = data?.transactions || [];
    const accounts = data?.accounts || [];

    // Filtra las transacciones según los filtros aplicados
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t: Transaction) => {
            const description = `${t.savings_goals?.name || 'Ahorro'} (${t.type === 'deposit' ? 'Depósito' : 'Retiro'})`;
            const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || t.type === typeFilter;
            const matchesAccount = accountFilter === 'All' || t.account_id === accountFilter;
            return matchesSearch && matchesType && matchesAccount;
        });
    }, [transactions, searchTerm, typeFilter, accountFilter]);

    // Calcula estadísticas de transacciones
    const stats = useMemo(() => {
        const incomes = filteredTransactions
            .filter((t: Transaction) => t.type === 'deposit')
            .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

        const expenses = filteredTransactions
            .filter((t: Transaction) => t.type === 'withdrawal')
            .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

        return {
            totalIncomes: incomes,
            totalExpenses: expenses,
            netBalance: incomes - expenses
        };
    }, [filteredTransactions]);

    // Exporta las transacciones a CSV
    const exportToCSV = () => {
        const headers = "Fecha,Meta,Flujo,Cuenta Origen,Tipo,Monto\n";
        const rows = transactions.map((t: Transaction) => {
            const fecha = new Date(t.created_at).toLocaleDateString();
            const meta = t.savings_goals?.name || 'General';
            const flujo = t.type === 'deposit' ? 'Ingreso' : 'Egreso';
            const cuenta = t.funding_accounts?.name || 'Principal';
            return `${fecha},"${meta}",${flujo},"${cuenta}",${t.type},${t.amount}`;
        }).join("\n");

        const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transacciones_savetrack_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
        exportToCSV,
        refresh
    };
};
