import React from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useParams, Link } from 'react-router-dom'; // Agregamos useParams
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Loader2, Menu, Target, TrendingUp } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

/**
 * PÁGINA DE DETALLES DE METAS
 * Recupera y muestra una meta específica basada en el ID de la URL.
 */
const GoalDetailsPage: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams(); // Capturamos el ID de la URL (ej: /goals/123)

    // Cambiamos el estado para guardar UN objeto, no un array
    const [goal, setGoal] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
        const weeklyInstallment = goal.target_amount / totalWeeksDuration;

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

                {/* SECCIÓN DE DEUDA ACUMULADA */}
                <div className={`mt-6 p-6 rounded-3xl border transition-all ${calculateWeeklyStatus(goal).isBehind ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${calculateWeeklyStatus(goal).isBehind ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {calculateWeeklyStatus(goal).isBehind ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${calculateWeeklyStatus(goal).isBehind ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {calculateWeeklyStatus(goal).balanceToPay > 0
                                    ? `Debe saldar $${calculateWeeklyStatus(goal).balanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} esta semana`
                                    : "¡Estás al día con tu meta!"
                                }
                            </h3>
                            <p className="text-sm text-[var(--muted)] mt-1">
                                {calculateWeeklyStatus(goal).isBehind
                                    ? `Semana ${calculateWeeklyStatus(goal).weeksElapsed} de ${calculateWeeklyStatus(goal).totalWeeksDuration}. Incluye saldo pendiente acumulado.`
                                    : "Has cumplido con los depósitos programados para esta semana."
                                }
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default GoalDetailsPage;