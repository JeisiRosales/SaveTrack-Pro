import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingDown, Plus, Menu } from 'lucide-react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { CreateExpenseModal } from '@/features/expense-transactions/components/CreateExpenseModal';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';
import { useExpenseTransactions } from '@/features/expense-transactions/hooks/useExpenseTransactions';
import { useGlobalSettings } from '@/context/SettingsContext';

interface ContextType {
    toggleSidebar: () => void;
}

export const Expenses: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // El hook retorna { transactions, add, remove }
    const { transactions } = useExpenseTransactions();
    const { currencySymbol } = useGlobalSettings();

    // Filtros de mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter(t => {
        const txDate = new Date(t.created_at);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calcular montos
    const totalMonthlyExpenses = monthlyExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
    // Asumimos 4 semanas por mes para el promedio semanal rápido
    const averageWeeklyExpenses = totalMonthlyExpenses / 4;

    // Dividir en fijos vs variables basado en una bandera custom o de categoría. 
    // Como Savetrack no tiene 'is_fixed' nativo, usaremos un hardcode o simplemente simularemos.
    // Opcional: podrías implementar un filtro real si el motor categoriza fixos/variables.
    // Para no romper esquemas, mostraremos todo fusionado o filtraremos en listas diferentes.

    // Formatear para tablas
    const formattedFixed = monthlyExpenses.filter(t => t.expense_categories?.name?.toLowerCase().includes('fijo') || t.expense_categories?.name?.toLowerCase().includes('suscripciones')).map((t: any) => ({
        ...t,
        universalType: 'expense',
        isPositive: false,
        entityName: t.description || t.expense_categories?.name || 'Gasto Fijo',
        categoryName: t.expense_categories?.name || 'General'
    }));

    const formattedVariables = monthlyExpenses.filter(t => !t.expense_categories?.name?.toLowerCase().includes('fijo') && !t.expense_categories?.name?.toLowerCase().includes('suscripciones')).map((t: any) => ({
        ...t,
        universalType: 'expense',
        isPositive: false,
        entityName: t.description || t.expense_categories?.name || 'Gasto Variable',
        categoryName: t.expense_categories?.name || 'General'
    }));

    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden font-black">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                        Mis Egresos
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">Control detallado de tus gastos mensuales fijos y variables.</p>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-3 bg-[var(--card)] rounded-xl hover:bg-[var(--background)] transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <div className="space-y-8">
                {/* Panel de Resumen Mensual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Total Gastos Mensuales</h3>
                        <p className="text-3xl font-black text-rose-500">
                            {currencySymbol}{totalMonthlyExpenses.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-soft)] rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Promedio Semanal Acumulado</h3>
                        <p className="text-3xl font-black text-[var(--foreground)]">
                            {currencySymbol}{averageWeeklyExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Listado Variables */}
                    <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50">
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Gastos Variables</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="hidden md:flex items-center gap-2 bg-[var(--background)] text-[var(--foreground)] hover:text-rose-500 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Añadir
                            </button>
                        </div>
                        <div className="p-4 flex-1">
                            <TransactionsTable transactions={formattedVariables} />
                        </div>
                    </div>

                    {/* Listado Fijos */}
                    <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Gastos Fijos/Suscripciones</h3>
                        </div>
                        <div className="p-4 flex-1">
                            <TransactionsTable transactions={formattedFixed} />
                        </div>
                    </div>
                </div>
            </div>

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateExpenseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </main>
    );
};
