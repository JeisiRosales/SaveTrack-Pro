import React from 'react';
import {
    CalendarClock,
    Menu,
    Plus,
    CheckCircle2,
    Clock,
    MoreVertical,
    CreditCard,
    AlertCircle,
    Pencil,
    Trash2
} from 'lucide-react';
import { FixedExpense, FixedExpenseSummary } from '../types';
import { DeleteFixedExpenseModal } from './DeleteFixedExpenseModal';
import HeroCard from '@/components/ui/HeroCard';

interface FixedExpenseViewProps {
    expenses: FixedExpense[];
    summary: FixedExpenseSummary;
    currencySymbol: string;
    onToggleSidebar: () => void;
    onAddExpense: () => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (id: string) => void;
}

export const FixedExpenseView: React.FC<FixedExpenseViewProps> = ({
    expenses,
    summary,
    currencySymbol,
    onToggleSidebar,
    onAddExpense,
    onEditExpense,
    onDeleteExpense
}) => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
    const [expenseToDelete, setExpenseToDelete] = React.useState<FixedExpense | null>(null);

    const fmt = (n: number) =>
        `${currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PAID':
                return {
                    label: 'Pagado',
                    color: 'bg-emerald-500/10 text-emerald-500',
                    icon: <CheckCircle2 className="w-3 h-3" />
                };
            case 'PARTIAL':
                return {
                    label: 'Parcial',
                    color: 'bg-amber-500/10 text-amber-500',
                    icon: <TrendingUp className="w-3 h-3" />
                };
            case 'OVERDUE':
                return {
                    label: 'Atrasado',
                    color: 'bg-rose-500/10 text-rose-500',
                    icon: <AlertCircle className="w-3 h-3" />
                };
            default:
                return {
                    label: 'Pendiente',
                    color: 'bg-orange-500/10 text-orange-500',
                    icon: <Clock className="w-3 h-3" />
                };
        }
    };

    const TrendingUp = ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    );

    const currentDay = new Date().getDate();
    const progressPercent = summary.totalMonthly > 0 ? (summary.paidThisMonth / summary.totalMonthly) * 100 : 0;

    return (
        <main className="flex-1 p-6 lg:p-10 pb-24 relative overflow-x-hidden transition-all duration-500">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full -z-10 animate-pulse" />
            <div className="absolute top-1/2 -left-20 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full -z-10" />

            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-2xl lg:text-3xl font-black text-[var(--foreground)] flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <CalendarClock className="w-7 h-7 text-indigo-500" />
                        </div>
                        Gastos Fijos
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1 font-medium">
                        Tus compromisos mensuales proyectados.
                    </p>
                </div>
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors shadow-sm text-[var(--foreground)]"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Top Cards Section */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom duration-1000">
                <HeroCard
                    label="Compromiso Mensual Total"
                    amount={fmt(summary.totalMonthly)}
                    sublabel={
                        <div className="flex flex-col gap-1">
                            <p className="opacity-90">Progreso de Pagos ({currentDay} del mes)</p>
                            <p className="text-[10px] tracking-wider uppercase font-black">Tus obligaciones proyectadas</p>
                        </div>
                    }
                    icon={CreditCard}
                >
                    <div className="space-y-6">
                        {/* Barra de progreso */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Estado Mensual</span>
                                <span className="text-sm font-black text-white">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Métricas detalladas */}
                        <div className="flex flex-wrap items-center gap-8 pt-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                                <span className="text-sm font-bold text-white/70">Pagado: <span className="text-white">{fmt(summary.paidThisMonth)}</span></span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]" />
                                <span className="text-sm font-bold text-white/70">Pendiente: <span className="text-white">{fmt(summary.pendingThisMonth)}</span></span>
                            </div>
                        </div>
                    </div>
                </HeroCard>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-[var(--foreground)]">Tus Suscripciones y Pagos</h3>
                    <div className="text-xs font-medium text-[var(--muted)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--card-border)]">
                        {expenses.length} items
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Add Item Card Placeholder */}
                    <button
                        onClick={onAddExpense}
                        className="group border-2 border-dashed border-[var(--card-border)] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-[var(--muted)] hover:text-indigo-500 min-h-[220px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg transition-all">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-sm">Agregar Nuevo Compromiso</p>
                    </button>
                    {expenses.map((expense, idx) => {
                        const statusCfg = getStatusConfig(expense.status);
                        return (
                            <div
                                key={expense.id}
                                className="group bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-500/20 animate-in fade-in slide-in-from-bottom duration-500"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl transition-colors ${statusCfg.color.split(' ')[0]}`}>
                                        <CreditCard className={`w-5 h-5 ${statusCfg.color.split(' ')[1]}`} />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === expense.id ? null : expense.id);
                                            }}
                                            className="p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-lg transition-colors border border-transparent hover:border-[var(--card-border)]"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {activeMenu === expense.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveMenu(null)}
                                                />
                                                <div className="absolute right-0 mt-2 w-32 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-1 z-20 animate-in fade-in zoom-in duration-200">
                                                    <button
                                                        onClick={() => {
                                                            onEditExpense(expense);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors first:rounded-t-xl"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setExpenseToDelete(expense);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/5 transition-colors last:rounded-b-xl border-t border-[var(--card-border)]"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-lg font-black text-[var(--foreground)] truncate">{expense.name}</h4>
                                    <p className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] opacity-30" />
                                        {expense.categoryName}
                                    </p>
                                </div>

                                <div className="mb-6 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--muted)] uppercase mb-0.5">Monto Mensual</p>
                                            <p className="text-xl font-black text-[var(--foreground)]">{fmt(expense.amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-[var(--muted)] uppercase mb-0.5">Día {expense.billing_day}</p>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusCfg.color}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barra de progreso por tarjeta */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-bold text-[var(--muted)] px-0.5">
                                            <span>{fmt(expense.paidAmount || 0)} pagado</span>
                                            <span>{Math.round(((expense.paidAmount || 0) / expense.amount) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]">
                                            <div 
                                                className={`h-full transition-all duration-700 ${
                                                    expense.status === 'PAID' ? 'bg-emerald-500' : 
                                                    expense.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-indigo-500'
                                                }`}
                                                style={{ width: `${Math.min(100, ((expense.paidAmount || 0) / expense.amount) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Modal de eliminación */}
            <DeleteFixedExpenseModal
                isOpen={!!expenseToDelete}
                onClose={() => setExpenseToDelete(null)}
                onConfirm={async (id) => {
                    await onDeleteExpense(id);
                }}
                expense={expenseToDelete}
            />
        </main>
    );
};
