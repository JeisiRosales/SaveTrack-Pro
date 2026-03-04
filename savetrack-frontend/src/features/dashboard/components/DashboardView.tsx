import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Loader2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import CreateGoalModal from '@/components/modals/CreateGoalModal';
import { useDashboard } from '../hooks/useDashboard';
import { AccountCard } from './AccountCard';
import { GoalCard } from './GoalCard';
import { TransactionItem } from './TransactionItem';

export const DashboardView: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        loading, error, accounts, goals, transactions,
        totalBalance, totalSavedInGoals, refresh
    } = useDashboard();

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--background)]">
            <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6 text-[var(--accent-text)]" />
                            Hola, <span className="text-[var(--accent-text)]">{user?.full_name?.split(' ')[0] || 'Usuario'}</span>
                        </h1>
                        <p className="text-[var(--muted)] text-xs mt-1 font-medium">Gestiona tu libertad financiera.</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {error ? (
                    <div className="p-6 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 text-center font-medium">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-8 max-w-[1200px]">
                        {/* Sección de Saldo */}
                        <section className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--card-border)] shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold">Saldo Total</h2>
                                <p className="text-[var(--muted)] text-xs">Tu capital neto disponible</p>
                                <h3 className="text-4xl font-bold text-[var(--accent-text)] mt-3">
                                    ${totalBalance.toLocaleString()}
                                </h3>
                                <p className="text-[var(--muted)] text-xs mt-2">Distribuido en {accounts.length} cuentas</p>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide font-black">
                                {accounts.map(acc => (
                                    <AccountCard
                                        key={acc.id}
                                        account={acc}
                                        totalBalance={totalBalance}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Metas */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="font-bold text-lg">Tus Metas</h2>
                                    <p className="text-[var(--muted)] text-xs">Progreso acumulado: ${totalSavedInGoals.toLocaleString()}</p>
                                </div>
                                <Link to="/goals" className="text-indigo-500 text-sm font-bold hover:underline transition-all">Ver Todo</Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                            </div>
                        </section>

                        {/* Transacciones */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Actividad Reciente</h2>
                                <Link to="/transactions" className="text-indigo-500 text-sm font-bold hover:underline transition-all">Ver Todo</Link>
                            </div>
                            <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
                                {transactions.length > 0 ? (
                                    <div className="divide-y divide-[var(--card-border)]">
                                        {transactions.slice(0, 5).map(tx => (
                                            <TransactionItem key={tx.id} transaction={tx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-[var(--muted)] text-sm">
                                        No hay movimientos recientes.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                <CreateGoalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onGoalCreated={refresh}
                />
            </main>
        </div>
    );
};
