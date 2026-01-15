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
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                            Hola, <span className="text-[var(--color-primary)]">{user?.full_name?.split(' ')[0] || 'User'}</span> 👋
                        </h1>
                        <p className="text-[var(--muted)] text-sm mt-1 font-medium">Gestiona tu libertad financiera.</p>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
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
                        <div className="bg-white p-8 lg:p-10 rounded-[2rem] border border-[var(--border)] shadow-sm">
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-800">Saldo Total</h2>
                                <p className="text-[var(--muted)] text-sm">Tu capital neto disponible</p>
                                <h3 className="text-5xl font-black mt-4 text-[var(--color-primary)]">
                                    ${totalBalance.toLocaleString()}
                                </h3>
                                <p className="text-[var(--muted)] text-xs mt-2">Distribuido en {accounts.length} cuentas</p>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Detalle por Cuenta:</h4>
                                {accounts.length > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors hidden sm:block">
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

                                        <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors hidden sm:block">
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[var(--muted)] text-sm italic">No hay cuentas configuradas.</p>
                                )}
                            </div>
                        </div>

                        {/* SECCIÓN 2: KPI DE METAS */}
                        <div className="bg-indigo-50/50 p-8 lg:p-10 rounded-[2rem] border border-indigo-100 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-800">Total Ahorrado en Metas</h2>
                            <h3 className="text-4xl font-black mt-4 text-[var(--color-primary)]">
                                ${totalSavedInGoals.toLocaleString()}
                            </h3>
                            <p className="text-[var(--muted)] text-xs mt-2">Progreso acumulado de tus {goals.length} metas</p>
                        </div>

                        {/* SECCIÓN 3: GESTIÓN DE METAS */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Tus Metas de Ahorro</h2>
                                    <p className="text-[var(--muted)] text-sm">Visualiza el avance hacia tus sueños</p>
                                </div>
                                <Link to="/goals" className="text-sm font-bold text-[var(--color-primary)] hover:underline">
                                    Ver Todo ({goals.length} {goals.length === 1 ? "Meta" : "Metas"})
                                </Link>
                            </div>

                            {goals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {goals.slice(0, 2).map(goal => (
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
                                    <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                                    <p className="text-[var(--muted)] text-sm">Últimos movimientos financieros</p>
                                </div>
                                <Link to="/transactions" className="text-sm font-bold text-[var(--color-primary)] hover:underline">
                                    Ver Todo
                                </Link>
                            </div>

                            <div className="bg-white border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-sm">
                                {transactions.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {transactions.slice(0, 5).map(tx => (
                                            <TransactionItem key={tx.id} transaction={tx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Historial Vacío</h3>
                                        <p className="text-[var(--muted)] text-sm mb-4">No se han registrado movimientos recientes.</p>
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
        <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDeposit ? 'bg-indigo-50 text-[var(--color-primary)]' : 'bg-red-50 text-red-500'
                    }`}>
                    <Plus className={`w-5 h-5 ${!isDeposit && 'rotate-45'}`} />
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 text-sm capitalize">
                        {isDeposit ? 'Depósito' : 'Retiro'}
                    </h5>
                    <p className="text-xs text-[var(--muted)]">
                        {transaction.funding_accounts?.name} → {transaction.savings_goals?.name || 'General'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-black ${isDeposit ? 'text-indigo-600' : 'text-red-600'}`}>
                    {isDeposit ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
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
    <div className="min-w-[280px] bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
            <h5 className="text-xs font-bold text-gray-800 leading-tight">{name}</h5>
            <p className="text-xl font-black mt-3 text-[var(--color-primary)]">{balance}</p>
        </div>
        <span className="text-[10px] font-bold bg-indigo-50 text-[var(--color-primary)] px-3 py-1 rounded-full border border-indigo-100">
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
        <div className="bg-white p-6 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs text-[var(--muted)]">
                    Vence el {new Date(goal.end_date).toLocaleDateString()}
                </p>
                <span className="text-xs font-bold text-[var(--color-primary)] bg-indigo-50 px-3 py-1 rounded-full">
                    {progress}%
                </span>
            </div>

            <h4 className="font-bold text-gray-900 mb-1">{goal.name}</h4>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg font-black text-[var(--color-primary)]">${goal.current_amount?.toLocaleString()}</span>
                <span className="text-xs text-[var(--muted)]">de ${goal.target_amount?.toLocaleString()}</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Dashboard;