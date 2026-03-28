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
import HeroCard from '@/components/ui/HeroCard';

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

                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Métricas Principales Unificadas */}
            <HeroCard
                label="Balance del Período"
                amount={`${currencySymbol}${(stats.totalIncomes - stats.totalExpenses).toLocaleString()}`}
                sublabel={
                    <div className="flex flex-col gap-1">
                        <p className="opacity-90">Análisis de flujo de caja</p>
                        <p className="text-[10px] tracking-wider uppercase font-black">{timeRange === 'all' ? 'Historial Completo' : `Filtro: ${timeRange}`}</p>
                    </div>
                }
                icon={Activity}
            >
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Ingresos
                        </p>
                        <p className="text-xl font-black text-emerald-200 leading-none">
                            {currencySymbol}{stats.totalIncomes.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Gastos
                        </p>
                        <p className="text-xl font-black text-rose-200 leading-none">
                            {currencySymbol}{stats.totalExpenses.toLocaleString()}
                        </p>
                    </div>
                </div>
            </HeroCard>

            <div className="mb-8" />

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