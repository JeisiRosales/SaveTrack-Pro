import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Target,
    TrendingUp,
    Clock,
    Plus,
    Pencil,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Menu,
    Loader2
} from 'lucide-react';
import { useGoalDetails } from '../hooks/useGoalDetails';
import { calculateWeeklyStatus } from '../utils/goal-calculations';
import EditGoalModal from './EditGoalModal';

interface GoalDetailViewProps {
    onSidebarOpen: () => void;
}

const GoalDetailView: React.FC<GoalDetailViewProps> = ({ onSidebarOpen }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        goal,
        transactions,
        loading,
        error,
        handleDeleteGoal,
        refresh
    } = useGoalDetails(id);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !goal) {
        return (
            <div className="flex-1 p-6 lg:p-10">
                <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center">
                    <p className="font-bold">{error || "No se encontró la meta."}</p>
                    <button
                        onClick={() => navigate('/goals')}
                        className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                    >
                        Volver a Metas
                    </button>
                </div>
            </div>
        );
    }

    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
    const status = calculateWeeklyStatus(goal);
    const isCompleted = goal.current_amount >= goal.target_amount;

    const onDelete = async () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta meta? Esta acción no se puede deshacer.")) {
            try {
                setIsDeleting(true);
                await handleDeleteGoal();
                navigate('/goals');
            } catch (err) {
                alert("Error al eliminar la meta. Intenta de nuevo.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <main className="flex-1 p-4 lg:p-10 relative">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/goals')}
                        className="p-2 lg:p-3 hover:bg-[var(--card)] rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl lg:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                            {goal.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 text-[var(--muted)] text-xs lg:text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            Finaliza el {new Date(goal.end_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 lg:p-3 bg-[var(--card)] text-[var(--foreground)] rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-all flex items-center gap-2 group shadow-sm"
                    >
                        <Pencil className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:inline text-sm font-semibold">Editar</span>
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-2 lg:p-3 bg-[var(--card)] text-rose-500 rounded-xl border border-[var(--card-border)] hover:bg-rose-50 transition-all flex items-center gap-2 group shadow-sm disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        <span className="hidden lg:inline text-sm font-semibold">Eliminar</span>
                    </button>
                    <button
                        onClick={onSidebarOpen}
                        className="lg:hidden p-3 bg-[var(--card)] rounded-xl border border-[var(--card-border)]"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Columna Izquierda: Detalles y Progreso */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    {/* Card de Progreso Principal */}
                    <div className="bg-[var(--card)] p-6 lg:p-10 rounded-[2.5rem] border border-[var(--card-border)] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="bg-indigo-500/10 p-4 rounded-3xl">
                                <TrendingUp className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Progreso Actual</span>
                            <div className="flex items-baseline gap-3 mb-6">
                                <h2 className="text-4xl lg:text-5xl font-black text-[var(--foreground)]">
                                    ${goal.current_amount.toLocaleString()}
                                </h2>
                                <span className="text-xl lg:text-2xl font-medium text-[var(--muted)]">
                                    / ${goal.target_amount.toLocaleString()}
                                </span>
                            </div>

                            <div className="w-full h-4 bg-[var(--background)] rounded-full overflow-hidden mb-6 border border-[var(--card-border)]">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 lg:gap-8">
                                <div className="bg-[var(--background)] p-4 rounded-3xl border border-[var(--card-border)]">
                                    <p className="text-[var(--muted)] text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1">Porcentaje</p>
                                    <p className="text-lg lg:text-xl font-black text-[var(--foreground)]">{progress}%</p>
                                </div>
                                <div className="bg-[var(--background)] p-4 rounded-3xl border border-[var(--card-border)]">
                                    <p className="text-[var(--muted)] text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1">Restante</p>
                                    <p className="text-lg lg:text-xl font-black text-rose-500">
                                        ${Math.max(0, goal.target_amount - goal.current_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-[var(--background)] p-4 rounded-3xl border border-[var(--card-border)]">
                                    <p className="text-[var(--muted)] text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1">Días</p>
                                    <p className="text-lg lg:text-xl font-black text-indigo-600">
                                        {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nueva Card: Salud de la Meta (Weekly Tracker) */}
                    <div className={`p-6 lg:p-8 rounded-[2.5rem] border transition-all ${isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : status.isBehind ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-3xl ${isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-600'
                                    : status.isBehind ? 'bg-rose-500/20 text-rose-600' : 'bg-emerald-500/20 text-emerald-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : (status.isBehind ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />)}
                                </div>
                                <div>
                                    <h3 className={`text-xl lg:text-2xl font-bold ${isCompleted
                                        ? 'text-emerald-700'
                                        : status.isBehind ? 'text-rose-700' : 'text-emerald-700'
                                        }`}>
                                        {isCompleted ? "¡Meta Cumplida!"
                                            : status.balanceToStayOnTrack > 0
                                                ? `Debes ahorrar $${status.balanceToStayOnTrack.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : "¡Vas al día con tus ahorros!"
                                        }
                                    </h3>
                                    <p className="text-sm lg:text-base text-[var(--muted)] font-medium mt-1">
                                        {isCompleted
                                            ? "Has alcanzado tu objetivo financiero con éxito."
                                            : status.isBehind
                                                ? `Te has retrasado un poco. Necesitas este monto para volver al carril.`
                                                : "Estás ahorrando lo necesario según tu plan semanal."}
                                    </p>
                                </div>
                            </div>
                            {!isCompleted && (
                                <div className="bg-white/50 p-4 rounded-2xl border border-[var(--card-border)] min-w-[180px]">
                                    <p className="text-[var(--muted)] text-[10px] font-bold uppercase mb-1">Cuota Semanal Recomendada</p>
                                    <p className="text-xl font-black text-[var(--foreground)]">${status.weeklyInstallment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transacciones de la Meta */}
                    <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--card-border)] shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 border-b border-[var(--card-border)] flex items-center justify-between">
                            <h3 className="font-bold text-lg lg:text-xl flex items-center gap-2">
                                <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                                Historial de Ahorros
                            </h3>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                {transactions.length} movimientos
                            </span>
                        </div>

                        <div className="divide-y divide-[var(--card-border)]">
                            {transactions.length > 0 ? (
                                transactions.map((t) => (
                                    <div key={t.id} className="p-4 lg:p-6 hover:bg-[var(--background)] transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                                <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)] text-sm lg:text-base">{t.description}</p>
                                                <p className="text-[var(--muted)] text-xs font-medium flex items-center gap-1.5 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(t.date).toLocaleDateString(undefined, {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-600 text-base lg:text-lg">+${t.amount.toLocaleString()}</p>
                                            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-tighter">Depósito</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 lg:p-20 text-center">
                                    <div className="bg-[var(--background)] w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--card-border)]">
                                        <Target className="w-8 h-8 lg:w-10 lg:h-10 text-[var(--muted)] opacity-20" />
                                    </div>
                                    <p className="text-[var(--muted)] text-sm font-medium">Aún no hay transacciones para esta meta.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Información adicional y consejos */}
                <div className="space-y-6 lg:space-y-8">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-6 h-6" /> Tip de Ahorro
                            </h3>
                            <p className="text-indigo-50 text-sm leading-relaxed font-medium">
                                "Para alcanzar esta meta antes de lo previsto, intenta automatizar una pequeña transferencia semanal desde tu cuenta principal."
                            </p>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--card-border)] shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            Analítica de Plan
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                                    <span>Plan Completado</span>
                                    <span>{Math.round((status.weeksElapsed / status.weeksDuration) * 100)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600"
                                        style={{ width: `${(status.weeksElapsed / status.weeksDuration) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[var(--muted)] text-[10px] mt-2 font-medium">
                                    Semana {status.weeksElapsed} de {status.weeksDuration}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-[var(--card-border)] space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted)] font-medium">Fecha Inicio</span>
                                    <span className="font-bold text-[var(--foreground)]">{new Date(goal.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted)] font-medium">Vencimiento</span>
                                    <span className="font-bold text-[var(--foreground)]">{new Date(goal.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditGoalModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                goal={goal}
                onGoalUpdated={refresh}
            />
        </main>
    );
};

export default GoalDetailView;
