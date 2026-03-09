import React from 'react';
import {
    Menu, Loader2, TrendingUp, TrendingDown,
    Activity, Download, Calendar
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFilters } from './TransactionFilters';
import { TransactionsTable } from './TransactionsTable';
import { useGlobalSettings } from '@/context/SettingsContext';

interface ContextType {
    toggleSidebar: () => void;
}

export const TransactionsView: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();

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
        exportToCSV,
        setTimeRange,
        timeRange
    } = useTransactions();

    const { currencySymbol } = useGlobalSettings();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden font-black">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)]">Movimientos de Cuenta</h1>
                    </div>
                    <p className="text-[var(--muted)] text-xs font-medium">Análisis global de flujo de caja.</p>
                </div>

                <button onClick={toggleSidebar} className="lg:hidden p-3 bg-[var(--card)] rounded-xl border border-[var(--card-border)]">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Métricas Principales Unificadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <MetricCard
                    label="Ingresos Totales"
                    value={stats.totalIncomes}
                    symbol={currencySymbol}
                    color="emerald"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <MetricCard
                    label="Gastos Totales"
                    value={stats.totalExpenses}
                    symbol={currencySymbol}
                    color="rose"
                    icon={<TrendingDown className="w-5 h-5" />}
                />
            </div>

            {/* Filtros de Acción Rápida (Temporales) */}
            <div className="mb-6 overflow-x-auto">
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex items-center gap-2 pr-4 border-r border-[var(--card-border)] mr-2">
                        <Calendar className="w-4 h-4 text-[var(--muted)]" />
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Periodo:</span>
                    </div>
                    <QuickFilterBtn label="Todo" onClick={() => setTimeRange?.('all')} active={timeRange === 'all'} />
                    <QuickFilterBtn label="Hoy" onClick={() => setTimeRange?.('today')} active={timeRange === 'today'} />
                    <QuickFilterBtn label="Ayer" onClick={() => setTimeRange?.('yesterday')} active={timeRange === 'yesterday'} />
                    <QuickFilterBtn label="Esta Semana" onClick={() => setTimeRange?.('week')} active={timeRange === 'week'} />
                    <QuickFilterBtn label="Quincenal" onClick={() => setTimeRange?.('biweekly')} active={timeRange === 'biweekly'} />
                    <QuickFilterBtn label="Este Mes" onClick={() => setTimeRange?.('month')} active={timeRange === 'month'} />
                    <QuickFilterBtn label="Mes Anterior" onClick={() => setTimeRange?.('last_month')} active={timeRange === 'last_month'} />
                    <QuickFilterBtn label="Este Año" onClick={() => setTimeRange?.('year')} active={timeRange === 'year'} />
                </div>
            </div>

            {/* Filtros Avanzados y Tabla */}
            <div className="space-y-6">
                <TransactionFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    accountFilter={accountFilter}
                    onAccountFilterChange={setAccountFilter}
                    accounts={allAccounts}
                />

                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden">
                    <TransactionsTable transactions={transactions} />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-xs font-bold hover:bg-[var(--background)] transition-all"
                    >
                        <Download className="w-4 h-4 text-indigo-500" />
                        Exportar Historial
                    </button>
                </div>
            </div>
        </main>
    );
};

// Componentes Auxiliares para Limpieza Visual
const MetricCard = ({ label, value, symbol, color, icon }: any) => (
    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${color === 'emerald' ? 'bg-emerald-500/5' : 'bg-rose-500/5'} rounded-bl-full -z-10`} />
        <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-black ${color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {symbol}{value.toLocaleString()}
            </h3>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {icon}
            </div>
        </div>
    </div>
);

const QuickFilterBtn = ({ label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${active
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
            : 'bg-[var(--card)] border-[var(--card-border)] text-[var(--muted)] hover:border-indigo-500/50 hover:text-[var(--foreground)]'
            }`}
    >
        {label}
    </button>
);