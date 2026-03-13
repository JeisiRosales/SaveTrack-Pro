import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Goal } from '../types';
import { calculateWeeklyStatus, PERIOD_THIS_PREFIX, PERIOD_UNIT_PLURAL_LABELS } from '../utils/goal-calculations';
import { useGlobalSettings } from '@/context/SettingsContext';

// interface para las props del componente GoalCard
interface GoalCardProps {
    goal: Goal;
}

// componente para mostrar una meta
const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
    const navigate = useNavigate();
    const { currencySymbol, budgetPeriod, periodUnitLabel } = useGlobalSettings();
    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
    const status = calculateWeeklyStatus(goal, budgetPeriod);
    const isCompleted = goal.current_amount >= goal.target_amount;

    const thisPrefix = PERIOD_THIS_PREFIX[budgetPeriod] || 'este';
    const pluralUnit = PERIOD_UNIT_PLURAL_LABELS[budgetPeriod] || 'semanas';

    return (
        <div
            onClick={() => navigate(`/goals/${goal.id}`)}
            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-[var(--muted)] text-xs mb-1">
                    Restan {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                </p>
                <span className="text-xs font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                    {progress}%
                </span>
            </div>

            <h4 className="font-bold text-[var(--foreground)] text-xl mb-1">{goal.name}</h4>
            <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-xs font-bold text-[var(--accent-text)]">{currencySymbol}{goal.current_amount?.toLocaleString()}</span>
                <span className="text-xs text-[var(--muted)] font-medium">/ {currencySymbol}{goal.target_amount?.toLocaleString()}</span>
            </div>

            <div className="w-full h-2.5 bg-[var(--background)] rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-2 pt-2 border-t border-[var(--card-border)]">
                <p className={`text-sm font-medium ${isCompleted
                    ? 'text-emerald-500 font-bold'
                    : status.isBehind ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                    {isCompleted
                        ? "¡Felicidades, has cumplido con tu meta de ahorro!"
                        : status.balanceToStayOnTrack > 0
                            ? `Debe saldar ${currencySymbol}${status.balanceToStayOnTrack.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${thisPrefix} ${periodUnitLabel}`
                            : "¡Vas al día con tus ahorros!"
                    }
                </p>

                {status.isBehind && !isCompleted && (
                    <span className="text-xs opacity-70 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Incluye depósito(s) de {pluralUnit} pendiente(s)
                    </span>
                )}
            </div>
        </div>
    );
};

export default GoalCard;
