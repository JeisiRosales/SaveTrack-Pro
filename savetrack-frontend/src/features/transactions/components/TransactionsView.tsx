import React, { useState } from 'react';
import { Menu, Loader2, TrendingUp, TrendingDown, ArrowUpCircle, Activity, Download } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFilters } from './TransactionFilters';
import { TransactionsTable } from './TransactionsTable';

// Vista de transacciones
export const TransactionsView: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const {
        transactions,
        allAccounts,
        loading,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        accountFilter,
        setAccountFilter,
        stats,
        exportToCSV
    } = useTransactions();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-5 h-5 text-[var(--accent-text)]" />
                            <h1 className="text-xl lg:text-2xl font-bold">Historial de Transacciones</h1>
                        </div>
                        <p className="text-[var(--muted)] text-xs font-medium">
                            Control detallado de tus movimientos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-[var(--card)] rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-sm font-bold mb-2">Total Depósitos</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-emerald-500">${stats.totalIncomes.toLocaleString()}</h3>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-sm font-bold mb-2">Total Retiros</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-rose-500">${stats.totalExpenses.toLocaleString()}</h3>
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-rose-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-sm font-bold mb-2">Balance Neto</p>
                        <div className="flex items-end justify-between">
                            <h3 className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                                ${stats.netBalance.toLocaleString()}
                            </h3>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <ArrowUpCircle className="w-5 h-5 text-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <TransactionFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    accountFilter={accountFilter}
                    onAccountFilterChange={setAccountFilter}
                    accounts={allAccounts}
                />

                <TransactionsTable transactions={transactions} />

                <div className="flex justify-end mt-6">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-xs font-bold hover:bg-[var(--accent-soft)] transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Historial (CSV)
                    </button>
                </div>
            </main>
        </div>
    );
};
