import React from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Agregamos useParams
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Loader2, Menu, Minus, Pencil, Plus, Target, Trash, TrendingUp } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import EditGoalModal from '../components/modals/EditGoalModal';


/**
 * PÁGINA DE DETALLES DE METAS
 * Recupera y muestra una meta específica basada en el ID de la URL.
 */
const GoalDetailsPage: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams(); // Capturamos el ID de la URL (ej: /goals/123)
    const navigate = useNavigate();
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [showMenu, setShowMenu] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);




    // Cambiamos el estado para guardar UN objeto, no un array
    const [goal, setGoal] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const fetchTransactions = async (goalId: string) => {
        try {
            const response = await api.get(`/transactions/goal/${goalId}`);
            setTransactions(response.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setTransactions([]);
        }
    };

    const handleEdit = () => {
        setShowMenu(false);
        navigate(`/goals/${goal.id}/edit`);
    };

    const handleDeleteConfirmed = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/savings-goals/${goal.id}`);
            navigate('/goals');
        } catch (error) {
            alert('Error al eliminar la meta');
            setIsDeleting(false);
        }
    };


    React.useEffect(() => {
        const closeMenu = () => setShowMenu(false);
        if (showMenu) {
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [showMenu]);


    // Efecto para cargar los datos de la meta específica
    React.useEffect(() => {
        const fetchGoalDetails = async () => {
            if (!id || !user) return;

            try {
                setLoading(true);
                const response = await api.get(`/savings-goals/${id}`);
                if (!response.data) {
                    setError('Meta no encontrada');
                } else {
                    setGoal(response.data);
                    await fetchTransactions(response.data.id);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al conectar con la API');
            } finally {
                setLoading(false);
            }
        };

        fetchGoalDetails();
    }, [id, user]);

    // Manejo de Estados de Carga y Error (UI Feedback)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (error || !goal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
                <p className="text-red-500 font-bold mb-4">{error || 'Meta no encontrada'}</p>
                <Link to="/goals" className="px-4 py-2 bg-[var(--card)] rounded-lg hover:bg-[var(--card-border)] transition-colors">
                    Volver a mis metas
                </Link>
            </div>
        );
    }

    // --- LÓGICA DE CÁLCULO DE SALDO SEMANAL ---
    const calculateWeeklyStatus = (goal: any) => {
        const startDate = new Date(goal.created_at);
        const endDate = new Date(goal.end_date);
        const today = new Date();

        // 1. Semanas que han pasado desde el inicio hasta hoy
        const diffInMs = today.getTime() - startDate.getTime();
        const weeksElapsed = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7)));

        // 2. Cuota semanal FIJA (Monto Total / Duración Total de la meta)
        const totalWeeksDuration = endDate.getTime() - startDate.getTime();
        const weeksDuration = Math.max(1, Math.ceil(totalWeeksDuration / (1000 * 60 * 60 * 24 * 7)));
        const weeklyInstallment = goal.target_amount / weeksDuration;

        // 3. Lo que el usuario debería tener ahorrado ACUMULADO hasta esta semana
        const expectedAccumulated = weeklyInstallment * weeksElapsed;

        // 4. Lo que le falta para estar al día (Deuda acumulada + cuota actual)
        const balanceToStayOnTrack = Math.max(0, expectedAccumulated - goal.current_amount);

        return {
            balanceToStayOnTrack,
            isBehind: goal.current_amount < expectedAccumulated,
            balanceToPay: balanceToStayOnTrack,
            weeksElapsed,
            totalWeeksDuration,
            weeklyInstallment,
            weeksDuration,
            expectedAccumulated
        };
    };

    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                <header className="mb-2 flex items-center justify-between">
                    <div>
                        <Link to="/goals" className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a metas
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* SECCIÓN 1: SALDO TOTAL Y CUENTAS */}
                <div className="bg-[var(--card)] p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                    <div className="mb-6">

                        {/* Nombre de la Meta */}
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--foreground)] mt-2">{goal.name}</h1>
                                <p className="text-[var(--muted)] text-xs mt-1 font-medium">Detalles de la meta financiera.</p>
                            </div>

                            {/* Botón de acciones */}
                            <div className="relative">
                                {/* Acciones */}
                                <div className="flex items-center gap-2 mt-2">
                                    {/* Editar */}
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="text-xm font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-5 py-2 rounded-xl hover:bg-[var(--background)] transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-sm"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* Saldo Actual y Objetivo*/}
                        <div className="flex justify-between items-end mt-6">
                            <div>
                                <h2 className="text-sm font-semibold text-[var(--muted)] tracking-wider">Saldo Actual</h2>
                                <h3 className="text-3xl font-bold mt-1 text-[var(--accent-text)]">
                                    ${goal.current_amount.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-[var(--muted)] font-semibold tracking-wider">Objetivo</p>
                                <p className="text-3xl font-bold mt-1 text-[var(--foreground)]">
                                    ${goal.target_amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-left items-center gap-1">
                            {/* Etiqueta de Días Transcurridos */}
                            <div className="">
                                <span className="text-xm font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-5 py-2 rounded-full">
                                    {(() => {
                                        const daysElapsed = Math.max(0, Math.floor((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)));
                                        return (
                                            <>
                                                {daysElapsed} {daysElapsed === 1 ? "Día transcurrido" : "Días transcurridos"}
                                            </>
                                        );
                                    })()}
                                </span>
                            </div>

                            {/* Etiqueta de Días Restantes */}
                            <span className="text-xs text-[var(--muted)] font-bold tracking-wider px-2">
                                Restan {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                            </span>
                        </div>

                        {/* BARRA DE PROGRESO */}
                        <div className="space-y-3 mb-6 mt-6">
                            <div className="flex justify-between text-sm font-semibold text-[var(--foreground)]">
                                <span>Progreso</span>
                                <span className="">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                            </div>
                        </div>

                        {/* GRID DE INFORMACIÓN */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-3 mb-2 text-[var(--muted)]">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase">Ahorro estimado</span>
                                </div>
                                <p className="text-xm font-bold">${calculateWeeklyStatus(goal).expectedAccumulated.toFixed(2)}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-3 mb-2 text-[var(--muted)]">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase">Creación</span>
                                </div>
                                <p className="text-xm font-bold text-sm">Creado el {new Date(goal.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-3 mb-2 text-[var(--muted)]">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase">Plazo</span>
                                </div>
                                <p className="text-xm font-bold text-sm">Vence el {new Date(goal.end_date).toLocaleDateString()}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-3 mb-2 text-[var(--muted)]">
                                    <Target className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase">Cuota Ideal</span>
                                </div>
                                <p className="text-xm font-bold">${calculateWeeklyStatus(goal).weeklyInstallment.toFixed(2)}/sem</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE ESTADO DE LA META */}
                {(() => {
                    const status = calculateWeeklyStatus(goal);
                    const isCompleted = goal.current_amount >= goal.target_amount;

                    // Definimos los estilos basados en el estado
                    const config = isCompleted
                        ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/20' }
                        : status.isBehind
                            ? { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-600', icon: <AlertCircle className="w-6 h-6" />, iconBg: 'bg-rose-500/10' }
                            : { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/10' };

                    return (
                        <div className={`mt-6 p-6 rounded-3xl border transition-all ${config.bg} ${config.border}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${config.iconBg} ${config.text}`}>
                                    {config.icon}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${config.text}`}>
                                        {isCompleted
                                            ? "¡Felicidades, has cumplido con tu meta!"
                                            : status.balanceToPay > 0
                                                ? `Debe saldar $${status.balanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} esta semana`
                                                : "¡Estás al día con tu meta!"
                                        }
                                    </h3>
                                    <p className="text-sm text-[var(--muted)] mt-1">
                                        {isCompleted
                                            ? "Has alcanzado el 100% de tu objetivo financiero. ¡Excelente trabajo!"
                                            : status.isBehind
                                                ? `Semana ${status.weeksElapsed} de ${status.weeksDuration}. Incluye saldo pendiente acumulado.`
                                                : "Has cumplido con los depósitos programados para esta semana."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* SECCIÓN DE HISTORIAL DE TRANSACCIONES */}
                <div>
                    <div className="flex items-center gap-2 mt-6">
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Historial de Transacciones</h1>
                    </div>
                    <p className="text-[var(--muted)] text-xs font-medium tracking-wider">
                        Control detallado de tus movimientos.
                    </p>
                </div>

                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm mt-4">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-[var(--muted)] text-sm font-medium">Cargando transacciones...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)] border-b border-[var(--card-border)]">
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Flujo</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Cuenta Origen</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--card-border)]">
                                    {transactions && transactions.length > 0 ? (
                                        transactions.map((t) => {
                                            const isDeposit = t.type === 'deposit';
                                            return (
                                                <tr key={t.id} className="hover:bg-[var(--background)] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                                                            <span className="text-xs font-medium">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '---'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--foreground)]">
                                                                {goal.name || 'Ahorro General'}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--muted)] font-medium italic">
                                                                {isDeposit ? 'Hacia Meta' : 'Desde Meta'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 bg-[var(--accent-soft)] text-[var(--accent-text)] text-[10px] font-bold rounded-lg uppercase">
                                                            {t.funding_accounts?.name || 'Desconocida'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDeposit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                {isDeposit ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                            </div>
                                                            <span className={`text-xs font-bold ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                {isDeposit ? 'Depósito' : 'Retiro'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`text-sm font-black ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {isDeposit ? '+' : '-'}${t.amount?.toLocaleString() || '0'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-[var(--muted)]" />
                                                    <p className="text-[var(--muted)] text-sm font-medium">
                                                        No hay movimientos registrados en esta meta.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <EditGoalModal
                    isOpen={showEditModal}
                    goal={goal}
                    onClose={() => setShowEditModal(false)}
                    onGoalUpdated={async () => {
                        setShowEditModal(false);
                        // volver a cargar la meta actualizada
                        const response = await api.get(`/savings-goals/${goal.id}`);
                        setGoal(response.data);
                    }}
                />


                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Fondo oscuro */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                            onClick={() => !isDeleting && setShowDeleteModal(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-[var(--card)] rounded-2xl border border-[var(--card-border)] shadow-xl w-full max-w-sm p-6 animate-scaleIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                                    <Trash className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold">
                                    Eliminar meta
                                </h3>
                            </div>

                            <p className="text-sm text-[var(--muted)] mb-6">
                                Esta acción eliminará <strong>{goal.name}</strong> permanentemente.
                                No podrás recuperar esta información.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    disabled={isDeleting}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                                >
                                    Cancelar
                                </button>

                                <button
                                    disabled={isDeleting}
                                    onClick={handleDeleteConfirmed}
                                    className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-2"
                                >
                                    {isDeleting && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default GoalDetailsPage;