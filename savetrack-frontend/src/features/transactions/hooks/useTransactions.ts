import { useState, useEffect, useMemo } from 'react';
import * as transactionsApi from '../api/transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Transaction } from '../types';
import { Account } from '@/features/accounts/types';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'deposit' | 'withdrawal'>('All');
    const [accountFilter, setAccountFilter] = useState<string>('All');

    // Hook para obtener transacciones y cuentas
    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, accRes] = await Promise.all([
                transactionsApi.getTransactions(),
                getAccounts()
            ]);
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
        } catch (err) {
            console.error("Error fetching transactions data:", err);
            setTransactions([]);
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener transacciones y cuentas
    useEffect(() => {
        fetchData();
    }, []);

    // Filtra las transacciones según los filtros aplicados
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
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
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const expenses = filteredTransactions
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
            totalIncomes: incomes,
            totalExpenses: expenses,
            netBalance: incomes - expenses
        };
    }, [filteredTransactions]);

    // Exporta las transacciones a CSV
    const exportToCSV = () => {
        const headers = "Fecha,Meta,Flujo,Cuenta Origen,Tipo,Monto\n";
        const rows = transactions.map(t => {
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
        refresh: fetchData
    };
};
