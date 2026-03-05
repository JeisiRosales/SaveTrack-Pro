import React, { useState } from 'react';
import { Target, Menu, Search, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useGoals } from '../hooks/useGoals';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Goal } from '../types';

interface ContextType {
    toggleSidebar: () => void;
}

// componente para mostrar las metas
const GoalsView: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();
    const {
        filteredGoals,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        stats,
        refreshGoals
    } = useGoals();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Configuración del banner de estado global
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
                    className="lg:hidden p-3 bg-[var(--card)] rounded-xl hover:bg-[var(--background)] transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* SECCIÓN 1: KPI DE METAS */}
            <div className="bg-[var(--accent-soft)] mb-4 p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Total Ahorrado en Metas</h2>
                <h3 className="text-2xl font-bold mt-2 text-[var(--accent-text)]">
                    ${stats.totalSaved.toLocaleString()}
                </h3>
                <p className="text-[var(--muted)] text-xs mt-1">Progreso acumulado de tus {filteredGoals.length} metas</p>
                <div className="text-[var(--foreground)] font-semibold text-xs mt-1">
                    <h3>Debes ahorrar ${stats.totalWeeklyInstallments.toFixed(2).toLocaleString()} semanalmente</h3>
                </div>
            </div>

            {/* SECCIÓN DE DINERO A RECOLECTAR */}
            {filteredGoals.length > 0 && (
                <div className={`mt-6 p-6 rounded-3xl border transition-all ${bannerConfig.bg} ${bannerConfig.border}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${bannerConfig.iconBg} ${bannerConfig.text}`}>
                            {bannerConfig.icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${bannerConfig.text}`}>
                                {allGoalsCompleted
                                    ? "¡Felicidades, todas tus metas están cumplidas!"
                                    : stats.totalBalanceToPay > 0
                                        ? `Debes saldar $${stats.totalBalanceToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} esta semana`
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

            {/* Filters */}
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--card-border)] mt-6 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar meta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--accent-soft)] rounded-md transition-colors text-[var(--muted)] hover:text-[var(--accent-text)]"
                                title="Limpiar búsqueda"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
            ) : error ? (
                <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center">
                    <p className="font-bold">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
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
