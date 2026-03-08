import React from 'react';
import { TrendingDown, Plus, Menu } from 'lucide-react';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';

interface ExpensesViewProps {
    data: any; // O define una interfaz con los tipos del hook
    onOpenModal: () => void;
    onToggleSidebar: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ data, onOpenModal, onToggleSidebar }) => {
    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden font-black">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                        Mis Egresos
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">Control detallado de tus gastos.</p>
                </div>
                <button onClick={onToggleSidebar} className="lg:hidden p-3 bg-[var(--card)] rounded-xl">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SummaryCard title="Total Mensual" value={data.totalMonthlyExpenses} symbol={data.currencySymbol} color="rose" />
                    <SummaryCard title="Promedio Semanal" value={data.averageWeeklyExpenses} symbol={data.currencySymbol} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <TableContainer title="Gastos Variables" onAdd={onOpenModal}>
                        <TransactionsTable transactions={data.formattedVariables} />
                    </TableContainer>
                    <TableContainer title="Gastos Fijos/Suscripciones">
                        <TransactionsTable transactions={data.formattedFixed} />
                    </TableContainer>
                </div>
            </div>
        </main>
    );
};

// Sub-componentes internos para limpieza
const SummaryCard = ({ title, value, symbol, color }: any) => (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 relative overflow-hidden group">
        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase mb-2">{title}</h3>
        <p className={`text-3xl font-black ${color === 'rose' ? 'text-rose-500' : 'text-[var(--foreground)]'}`}>
            {symbol}{value.toLocaleString()}
        </p>
    </div>
);

const TableContainer = ({ title, children, onAdd }: any) => (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50">
            <h3 className="text-sm font-bold">{title}</h3>
            {onAdd && (
                <button onClick={onAdd} className="hidden md:flex items-center gap-2 text-xs font-bold hover:text-rose-500">
                    <Plus className="w-4 h-4" /> Añadir
                </button>
            )}
        </div>
        <div className="p-4 flex-1">{children}</div>
    </div>
);