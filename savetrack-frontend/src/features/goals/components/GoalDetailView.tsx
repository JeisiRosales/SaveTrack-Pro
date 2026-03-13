import React, { useState } from 'react';
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
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
import { calculateWeeklyStatus, PERIOD_THIS_PREFIX } from '../utils/goal-calculations';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { TransactionModal } from '@/features/transactions/components/TransactionModal';
import EditGoalModal from './EditGoalModal';
import DeleteGoalModal from './DeleteGoalModal';
import { useGlobalSettings } from '@/context/SettingsContext';

interface ContextType {
    toggleSidebar: () => void;
}

const GoalDetailView: React.FC = () => {
    const { currencySymbol, budgetPeriod, periodUnitLabel, periodInstallmentLabel } = useGlobalSettings();
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

    // Calcular estado con el período configurado por el usuario
    const status = calculateWeeklyStatus(goal, budgetPeriod);
    const isCompleted = goal.current_amount >= goal.target_amount;

    // Capitalizar primera letra para textos de UI
    const periodUnitCap = periodUnitLabel.charAt(0).toUpperCase() + periodUnitLabel.slice(1);

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

    // Config del banner de estado
    const thisPrefix = PERIOD_THIS_PREFIX[budgetPeriod] || 'este';

    const config = isCompleted
        ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/20' }
        : status.isBehind
            ? { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-600', icon: <AlertCircle className="w-6 h-6" />, iconBg: 'bg-rose-500/10' }
            : { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/10' };

    return (
        <main className="flex-1 p-4 lg:p-10 relative overflow-x-hidden">
            <header className="mb-6 flex items-center justify-between">
                <Link to="/goals" className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a metas
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
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

                    {/* Saldo Actual y Objetivo */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-xs font-semibold text-[var(--muted)] tracking-wider">Saldo Actual</h2>
                            <h3 className="text-3xl sm:text-4xl font-black mt-1 text-[var(--accent-text)]">
                                {currencySymbol}{goal.current_amount.toLocaleString()}
                            </h3>
                        </div>
                        <div className="sm:text-right">
                            <h2 className="text-xs font-semibold text-[var(--muted)] tracking-wider">Meta</h2>
                            <h3 className="text-xl sm:text-2xl font-black mt-1 text-[var(--foreground)]">
                                {currencySymbol}{goal.target_amount.toLocaleString()}
                            </h3>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-[var(--muted)]">Progreso</span>
                            <span className="text-xs font-black text-indigo-400">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-[var(--card-border)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: progress >= 75 ? '#10b981' : progress >= 40 ? '#6366f1' : '#f87171'
                                }}
                            />
                        </div>
                    </div>

                    {/* Métricas del período */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--card-border)]">
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                {periodInstallmentLabel}
                            </p>
                            <p className="text-sm font-black text-indigo-400">
                                {currencySymbol}{status.weeklyInstallment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--card-border)]">
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                Esperado hoy
                            </p>
                            <p className="text-sm font-black text-[var(--foreground)]">
                                {currencySymbol}{status.expectedAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--card-border)]">
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                Progeso por {periodUnitCap}
                            </p>
                            <p className="text-sm font-black text-[var(--foreground)]">
                                {status.weeksElapsed} de {status.totalWeeksDuration}
                            </p>
                        </div>
                        <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--card-border)]">
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                Fecha límite
                            </p>
                            <p className="text-sm font-black text-[var(--foreground)]">
                                {new Date(goal.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BANNER DE ESTADO */}
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
                                    ? `Debes saldar ${currencySymbol}${status.balanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${thisPrefix} ${periodUnitLabel}`
                                    : `¡Estás al día con tu meta!`
                            }
                        </h3>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            {isCompleted
                                ? "Has alcanzado el 100% de tu objetivo financiero. ¡Excelente trabajo!"
                                : status.isBehind
                                    ? `${periodUnitCap} ${status.weeksElapsed} de ${status.weeksDuration}. Incluye depósitos de ${thisPrefix} ${periodUnitLabel}.`
                                    : `Has cumplido con todos los depósitos programados.`
                            }
                        </p>
                    </div>
                </div>
            </div>

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
                goalTarget={goal.target_amount}
                goalCurrent={goal.current_amount}
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