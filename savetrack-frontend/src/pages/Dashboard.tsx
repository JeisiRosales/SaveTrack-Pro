import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import CreateGoalModal from '../components/modals/CreateGoalModal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Menu, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

/**
 * Página de Dashboard Principal
 * Es el contenedor principal que ensambla la UI premium con datos reales e integrados.
 */
const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    // ESTADOS PARA DATOS REALES
    const [accounts, setAccounts] = React.useState<any[]>([]);
    const [goals, setGoals] = React.useState<any[]>([]);
    const [transactions, setTransactions] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch resiliente: si uno falla (ej. transacciones), el resto se muestra
                const [accountsRes, goalsRes, transactionsRes] = await Promise.allSettled([
                    api.get('/funding-accounts'),
                    api.get('/savings-goals'),
                    api.get('/transactions')
                ]);

                if (accountsRes.status === 'fulfilled') setAccounts(accountsRes.value.data);
                if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
                if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data);

                // Solo consideramos error crítico si fallan las cuentas o metas
                if (accountsRes.status === 'rejected' || goalsRes.status === 'rejected') {
                    throw new Error("No se pudo cargar la información esencial del dashboard.");
                }
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError("No se pudo sincronizar la información. Por favor, intenta de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función para refrescar datos tras una acción (ej: crear meta)
    const refreshData = async () => {
        try {
            const [accountsRes, goalsRes, transactionsRes] = await Promise.allSettled([
                api.get('/funding-accounts'),
                api.get('/savings-goals'),
                api.get('/transactions')
            ]);
            if (accountsRes.status === 'fulfilled') setAccounts(accountsRes.value.data);
            if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
            if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data);
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    // CÁLCULOS MATEMÁTICOS REALES
    const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
    const totalSavedInGoals = goals.reduce((acc, curr) => acc + (curr.current_amount || 0), 0);

    const handleCreateGoal = () => {
        setIsCreateModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                            Hola, <span className="text-[var(--accent-text)]">{user?.full_name?.split(' ')[0] || 'User'}</span>
                        </h1>
                        <p className="text-[var(--muted)] text-xs mt-1 font-medium">Gestiona tu libertad financiera.</p>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-[1200px]">

                        {/* SECCIÓN 1: SALDO TOTAL Y CUENTAS */}
                        <div className="bg-[var(--card)] p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">Saldo Total</h2>
                                <p className="text-[var(--muted)] text-xs">Tu capital neto disponible</p>
                                <h3 className="text-3xl font-bold mt-3 text-[var(--accent-text)]">
                                    ${totalBalance.toLocaleString()}
                                </h3>
                                <p className="text-[var(--muted-foreground)] text-[10px] mt-1.5">Distribuido en {accounts.length} cuentas</p>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-wider">Detalle por Cuenta:</h4>
                                {accounts.length > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <button className="p-2 bg-[var(--accent-soft)] hover:bg-gray-100 rounded-lg border border-[var(--card-border)] transition-colors hidden sm:block">
                                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                                        </button>

                                        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {accounts.map(acc => (
                                                <AccountCard
                                                    key={acc.id}
                                                    name={acc.name}
                                                    balance={`$${acc.balance.toLocaleString()}`}
                                                    percentage={totalBalance > 0 ? `${Math.round((acc.balance / totalBalance) * 100)}%` : '0%'}
                                                />
                                            ))}
                                        </div>

                                        <button className="p-2 bg-[var(--accent-soft)] hover:bg-gray-100 rounded-lg border border-[var(--card-border)] transition-colors hidden sm:block">
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[var(--muted)] text-sm italic">No hay cuentas configuradas.</p>
                                )}
                            </div>
                        </div>

                        {/* SECCIÓN 2: KPI DE METAS */}
                        <div className="bg-[var(--accent-soft)] p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                            <h2 className="text-xs font-semibold text-[var(--foreground)] tracking-wider">Total Ahorrado en Metas</h2>
                            <h3 className="text-2xl font-bold mt-2 text-[var(--accent-text)]">
                                ${totalSavedInGoals.toLocaleString()}
                            </h3>
                            <p className="text-[var(--muted)] text-[10px] mt-1">Progreso acumulado de tus {goals.length} metas</p>
                        </div>

                        {/* SECCIÓN 3: GESTIÓN DE METAS */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--foreground)]">Tus Metas</h2>
                                    <p className="text-[var(--muted)] text-xs">Visualiza el avance hacia tus sueños</p>
                                </div>
                                <Link to="/goals" className="text-xs font-semibold text-[var(--accent-text)] hover:opacity-80 transition-opacity">
                                    Ver Todo
                                </Link>
                            </div>

                            {goals.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {goals
                                        .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
                                        .map(goal => (
                                            <GoalCard key={goal.id} goal={goal} />
                                        ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                                    <p className="text-[var(--muted)] text-sm">Aún no has creado metas de ahorro.</p>
                                </div>
                            )}
                        </section>

                        {/* SECCIÓN 4: TRANSACCIONES */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--foreground)]">Actividad Reciente</h2>
                                    <p className="text-[var(--muted)] text-sm">Últimos movimientos financieros</p>
                                </div>
                                <Link to="/transactions" className="text-sm font-bold text-[var(--color-primary)] hover:underline">
                                    Ver Todo
                                </Link>
                            </div>

                            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm">
                                {transactions.length > 0 ? (
                                    <div className="divide-y divide-[var(--card-border)]">
                                        {transactions.slice(0, 5).map(tx => (
                                            <TransactionItem key={tx.id} transaction={tx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-[var(--muted)] text-sm italic">
                                        No hay movimientos recientes.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                <FloatingActionButton onClick={handleCreateGoal} />

                <CreateGoalModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onGoalCreated={refreshData}
                />
            </main>
        </div>
    );
};

/**
 * Componente Item de Transacción
 */
const TransactionItem = ({ transaction }: { transaction: any }) => {
    const isDeposit = transaction.type === 'deposit';

    return (
        <div className="p-4 flex items-center justify-between hover:bg-[var(--background)] transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeposit ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]' : 'bg-rose-500/10 text-rose-500'}`}>
                    <Plus className={`w-4 h-4 ${!isDeposit && 'rotate-45'}`} />
                </div>
                <div>
                    <h5 className="font-semibold text-[var(--foreground)] text-xs capitalize">
                        {isDeposit ? 'Depósito' : 'Retiro'}
                    </h5>
                    <p className="text-[10px] text-[var(--muted)]">
                        {transaction.funding_accounts?.name} → {transaction.savings_goals?.name || 'General'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isDeposit ? 'text-[var(--accent-text)]' : 'text-rose-500'}`}>
                    {isDeposit ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {new Date(transaction.created_at).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

/**
 * Componente Tarjeta de Cuenta
 */
const AccountCard = ({ name, balance, percentage }: { name: string, balance: string, percentage: string }) => (
    <div className="min-w-[240px] bg-[var(--card)] p-4 rounded-xl border border-[var(--card-border)] flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
            <h5 className="text-[10px] font-semibold text-[var(--muted)] tracking-wider">{name}</h5>
            <p className="text-lg font-bold mt-2 text-[var(--accent-text)]">{balance}</p>
        </div>
        <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
            {percentage}
        </span>
    </div>
);

/**
 * Componente Tarjeta de Meta de Ahorro
 */
const GoalCard = ({ goal }: { goal: any }) => {
    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);

    return (
        <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] text-[var(--muted)] font-semibold">
                    Restan {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                </p>
                <span className="text-[10px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                    {progress}%
                </span>
            </div>

            <h4 className="font-bold text-[var(--foreground)] text-sm mb-1">{goal.name}</h4>
            <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-base font-bold text-[var(--accent-text)]">${goal.current_amount?.toLocaleString()}</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">/ ${goal.target_amount?.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default Dashboard;