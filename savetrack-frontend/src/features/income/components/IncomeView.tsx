import React from 'react';
import { TrendingUp, Plus, Menu } from 'lucide-react';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';

interface IncomesViewProps {
    data: any;
    onOpenModal: () => void;
    onToggleSidebar: () => void;
}

export const IncomesView: React.FC<IncomesViewProps> = ({ data, onOpenModal, onToggleSidebar }) => {
    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden font-black">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Mis Ingresos
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">Controla y monitorea tus fuentes de entrada este mes.</p>
                </div>
                <button onClick={onToggleSidebar} className="lg:hidden p-3 bg-[var(--card)] rounded-xl">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IncomeStatCard
                        label="Ingreso Mensual Total"
                        value={data.totalMonthlyIncome}
                        symbol={data.currencySymbol}
                        isPrimary
                    />
                    <IncomeStatCard
                        label="Promedio Semanal"
                        value={data.averageWeeklyIncome}
                        symbol={data.currencySymbol}
                    />
                </div>

                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">Últimos Ingresos</h3>
                        <button
                            onClick={onOpenModal}
                            className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Añadir Ingreso
                        </button>
                    </div>
                    <div className="p-4">
                        <TransactionsTable transactions={data.formattedTransactions} />
                    </div>
                </div>
            </div>
        </main>
    );
};

const IncomeStatCard = ({ label, value, symbol, isPrimary }: any) => (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 ${isPrimary ? 'bg-emerald-500/10' : 'bg-[var(--accent-soft)]'} rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />
        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">{label}</h3>
        <p className={`text-3xl font-black ${isPrimary ? 'text-emerald-500' : 'text-[var(--foreground)]'}`}>
            {symbol}{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
    </div>
);