import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Plus, Menu } from 'lucide-react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { CreateIncomeModal } from '@/features/income-transactions/components/CreateIncomeModal';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';
import { useIncomeTransactions } from '@/features/income-transactions/hooks/useIncomeTransactions';
import { useGlobalSettings } from '@/context/SettingsContext';

interface ContextType {
    toggleSidebar: () => void;
}

export const Incomes: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // El hook retorna { transactions, add, remove }, NO { incomeTransactions, loading }
    const { transactions } = useIncomeTransactions();
    const { currencySymbol } = useGlobalSettings();

    // Filtros de mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncomes = transactions.filter(t => {
        const txDate = new Date(t.created_at);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calcular montos
    const totalMonthlyIncome = monthlyIncomes.reduce((acc, t) => acc + Number(t.amount), 0);
    // Asumimos 4 semanas por mes para el promedio semanal rápido
    const averageWeeklyIncome = totalMonthlyIncome / 4;

    // Formatear para la tabla compartida
    const formattedTransactions = monthlyIncomes.map((t: any) => ({
        ...t,
        universalType: 'income',
        isPositive: true,
        entityName: t.description || t.income_categories?.name || 'Ingreso',
        categoryName: t.income_categories?.name || 'General'
    }));

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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Ingreso Mensual Total</h3>
                        <p className="text-3xl font-black text-emerald-500">
                            {currencySymbol}{totalMonthlyIncome.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-soft)] rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Promedio Semanal</h3>
                        <p className="text-3xl font-black text-[var(--foreground)]">
                            {currencySymbol}{averageWeeklyIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Listado Principal de Ingresos */}
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">Últimos Ingresos del Mes</h3>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Añadir Ingreso
                        </button>
                    </div>
                    <div className="p-4">
                        <TransactionsTable transactions={formattedTransactions} />
                    </div>
                </div>
            </div>

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateIncomeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </main>
    );
};
