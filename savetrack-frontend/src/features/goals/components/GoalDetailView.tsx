import React, { useState } from 'react';
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Menu,
    Loader2,
    Plus,
    Minus,
    Trash,
    Pencil
} from 'lucide-react';
import { useGoalDetails } from '../hooks/useGoalDetails';
import { calculateWeeklyStatus } from '../utils/goal-calculations';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { TransactionModal } from '@/features/transactions/components/TransactionModal';
import EditGoalModal from './EditGoalModal';
import DeleteGoalModal from './DeleteGoalModal';
import { useGlobalSettings } from '@/context/SettingsContext';

interface ContextType {
    toggleSidebar: () => void;
}

const GoalDetailView: React.FC = () => {
    const { currencySymbol } = useGlobalSettings();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toggleSidebar } = useOutletContext<ContextType>();
    const {
        goal,
        transactions,
        loading,
        error,
        handleDeleteGoal,
        refresh
    } = useGoalDetails(id);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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

    const onDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await handleDeleteGoal();
            navigate('/goals');
        } catch (err) {
            alert("Error al eliminar la meta. Intenta de nuevo.");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <main className="flex-1 p-4 lg:p-10 relative overflow-x-hidden">
            <header className="mb-6 flex items-center justify-between">
                <Link to="/goals" className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a metas
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-3 bg-[var(--card)] rounded-xl hover:bg-[var(--background)] transition-colors flex items-center justify-center"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* SECCIÓN 1: SALDO TOTAL Y CUENTAS */}
            <div className="bg-[var(--card)] p-4 sm:p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                <div className="mb-6">

                    {/* Nombre de la Meta y Acciones */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mt-2 tracking-tight">{goal.name}</h1>
                            <p className="text-[var(--muted)] text-[10px] sm:text-xs mt-1 font-medium tracking-wider">Detalles de la meta financiera</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)] hover:bg-[var(--background)] transition-all"
                                title="Editar meta"
                            >
                                <Pencil className="w-4 h-4" />
                                <span className="sm:hidden">Editar</span>
                            </button>

                            <button
                                onClick={() => onDelete()}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-sm"
                                title="Eliminar meta"
                            >
                                <Trash className="w-4 h-4" />
                                <span className="sm:hidden">Eliminar</span>
                            </button>
                        </div>
                    </div>

                    {/* Saldo Actual y Objetivo*/}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-xs font-semibold text-[var(--muted)] tracking-wider">Saldo Actual</h2>
                            <h3 className="text-3xl sm:text-4xl font-black mt-1 text-[var(--accent-text)]">
                                {currencySymbol}{goal.current_amount.toLocaleString()}
                            </h3>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-xs text-[var(--muted)] font-semibold tracking-wider">Objetivo</p>
                            <p className="text-3xl sm:text-4xl font-black mt-1 text-[var(--foreground)]">
                                {currencySymbol}{goal.target_amount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {/* Etiqueta de Días Transcurridos */}
                        <div className="flex-shrink-0">
                            <span className="text-[10px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-4 py-2 rounded-full uppercase tracking-wider">
                                {(() => {
                                    const daysElapsed = Math.max(0, Math.floor((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)));
                                    return (
                                        <>
                                            {daysElapsed} {daysElapsed === 1 ? "Día" : "Días"}
                                        </>
                                    );
                                })()}
                            </span>
                        </div>

                        {/* Etiqueta de Días Restantes */}
                        <span className="text-[10px] text-[var(--muted)] font-bold tracking-widest uppercase">
                            {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días restantes
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
                            <p className="text-xm font-bold">{currencySymbol}{calculateWeeklyStatus(goal).expectedAccumulated.toFixed(2)}</p>
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
                            <p className="text-xm font-bold">{currencySymbol}{calculateWeeklyStatus(goal).weeklyInstallment.toFixed(2)}/sem</p>
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
                                            ? `Debe saldar ${currencySymbol}${status.balanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} esta semana`
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
                                                        {isDeposit ? '+' : '-'}{currencySymbol}{t.amount?.toLocaleString() || '0'}
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

            <FloatingActionButton onClick={() => setIsTransactionModalOpen(true)} />

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSuccess={refresh}
                goalId={id}
            />

            <EditGoalModal
                isOpen={isEditModalOpen}
                goal={goal}
                onClose={() => setIsEditModalOpen(false)}
                onGoalUpdated={refresh}
            />

            <DeleteGoalModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                goalName={goal.name}
                isDeleting={isDeleting}
            />
        </main>
    );
};

export default GoalDetailView;
