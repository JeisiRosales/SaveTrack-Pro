import React, { useState } from 'react';
import { Target, Menu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useGoals } from '../hooks/useGoals';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Goal } from '../types';
import { useGlobalSettings } from '@/context/SettingsContext';
import HeroCard from '@/components/ui/HeroCard';

interface ContextType {
    toggleSidebar: () => void;
}

const GoalsView: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();
    const {
        filteredGoals,
        loading,
        error,
        stats,
        refreshGoals
    } = useGoals();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { currencySymbol, periodLabel, periodUnitLabel } = useGlobalSettings();

    const allGoalsCompleted = stats.activeGoalsCount === 0 && filteredGoals.length > 0;
    const isBehind = stats.anyGoalBehind;

    const bannerConfig = allGoalsCompleted
        ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/20' }
        : isBehind
            ? { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-600', icon: <AlertCircle className="w-6 h-6" />, iconBg: 'bg-rose-500/10' }
            : { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-600', icon: <CheckCircle2 className="w-6 h-6" />, iconBg: 'bg-emerald-500/10' };

    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Target className="w-6 h-6 text-[var(--accent-text)]" />
                        Mis Metas
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">Gestiona tus objetivos financieros a largo plazo.</p>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* SECCIÓN 1: KPI DE METAS */}
            <HeroCard
                label="Total Ahorrado en Metas"
                amount={`${currencySymbol}${stats.totalSaved.toLocaleString()}`}
                sublabel={
                    <div className="flex flex-col gap-1">
                        <p className="opacity-90">Debes ahorrar {currencySymbol}{stats.totalWeeklyInstallments.toFixed(2).toLocaleString()} {periodLabel}</p>
                        <p className="text-[10px] tracking-wider uppercase font-black">Progreso acumulado de tus {filteredGoals.length} metas</p>
                    </div>
                }
                icon={Target}
                showSeparator={false}
            />

            {/* SECCIÓN DE DINERO A RECOLECTAR */}
            {filteredGoals.length > 0 && (
                <div className={`mt-6 mb-6 p-6 rounded-3xl border transition-all ${bannerConfig.bg} ${bannerConfig.border}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${bannerConfig.iconBg} ${bannerConfig.text}`}>
                            {bannerConfig.icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${bannerConfig.text}`}>
                                {allGoalsCompleted
                                    ? "¡Felicidades, todas tus metas están cumplidas!"
                                    : stats.totalBalanceToPay > 0
                                        // "esta semana" → dinámico según período
                                        ? `Debes saldar ${currencySymbol}${stats.totalBalanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este ${periodUnitLabel}`
                                        : "¡Estás al día con todas tus metas!"
                                }
                            </h3>
                            <p className="text-sm text-[var(--muted)] mt-1">
                                {allGoalsCompleted
                                    ? `Has completado tus ${stats.completedGoalsCount} objetivos financieros.`
                                    : isBehind
                                        ? `Tienes saldo pendiente acumulado en tus metas activas.`
                                        : `Vas por buen camino con tus ${stats.activeGoalsCount} metas vigentes.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
            ) : error ? (
                <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center">
                    <p className="font-bold">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 mt-6 md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredGoals.length > 0 ? (
                        filteredGoals.map((goal: Goal) => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))
                    ) : (
                        <div className="col-span-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-12 text-center">
                            <p className="text-[var(--muted)] text-sm">Aún no has creado metas de ahorro.</p>
                        </div>
                    )}
                </div>
            )}

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGoalCreated={refreshGoals}
            />
        </main>
    );
};

export default GoalsView;