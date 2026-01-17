import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import CreateGoalModal from '../components/modals/CreateGoalModal';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import { useAuth } from '../context/AuthContext';
import { Target, Loader2, Menu, Search, X, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

/**
 * PÁGINA DE METAS
 * Permite a los usuarios visualizar y gestionar sus metas de ahorro.
 */
const Goals: React.FC = () => {
    useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [goals, setGoals] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const navigate = useNavigate();

    // Filtros
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoading(true);
                const response = await api.get('/savings-goals');
                setGoals(response.data);
            } catch (err: any) {
                console.error("Error fetching goals:", err);
                setError("No se pudieron cargar tus metas. Por favor, intenta de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    // CÁLCULOS MATEMÁTICOS REALES
    const totalSavedInGoals = goals.reduce((acc, curr) => acc + (curr.current_amount || 0), 0);

    const handleCreateGoal = () => {
        setIsCreateModalOpen(true);
    };

    const refreshData = async () => {
        try {
            const [goalsRes] = await Promise.allSettled([
                api.get('/savings-goals'),
            ]);
            if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    // Lógica de Filtrado y Ordenamiento Combinada
    const filteredGoals = React.useMemo(() => {
        return goals
            .filter((goal) => {
                // Filtro por texto (Nombre de la meta)
                const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase());

                return matchesSearch;
            })
            .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    }, [goals, searchTerm]);

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
            isBehind: goal.current_amount < expectedAccumulated
        };
    };

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                            <Target className="w-6 h-6 text-[var(--accent-text)]" />
                            Mis Metas
                        </h1>
                        <p className="text-[var(--muted)] text-xs mt-1 font-medium">Gestiona tus objetivos financieros a largo plazo.</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                </header>

                {/* SECCIÓN 1: KPI DE METAS */}
                <div className="bg-[var(--accent-soft)] mb-6 p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                    <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Total Ahorrado en Metas</h2>
                    <h3 className="text-2xl font-bold mt-2 text-[var(--accent-text)]">
                        ${totalSavedInGoals.toLocaleString()}
                    </h3>
                    <p className="text-[var(--muted)] text-[10px] mt-1">Progreso acumulado de tus {goals.length} metas</p>
                </div>

                {/* Filters */}
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--card-border)] mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                            <input
                                type="text"
                                placeholder="Buscar por meta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {/* BOTÓN DE LIMPIAR BÚSQUEDA */}
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
                            filteredGoals
                                .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
                                .map((goal) => {
                                    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
                                    return (
                                        <div key={goal.id} onClick={() => navigate(`/goals/${goal.id}`)} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <p className="text-[10px] text-[var(--muted)] font-semibold">
                                                    Vence el {new Date(goal.end_date).toLocaleDateString()}
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

                                            <p className="text-[var(--muted)] text-[10px] mb-1">Progreso acumulado</p>
                                            <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-[var(--muted)] font-semibold mt-4">
                                                Restan {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                                            </p>
                                            <div className="mt-2 pt-2 border-t border-[var(--card-border)]">
                                                <p className={`text-sm font-medium ${calculateWeeklyStatus(goal).isBehind ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {calculateWeeklyStatus(goal).balanceToStayOnTrack > 0
                                                        ? `Debe saldar $${calculateWeeklyStatus(goal).balanceToStayOnTrack.toFixed(2)} esta semana`
                                                        : "¡Vas al día con tus ahorros!"
                                                    }
                                                </p>

                                                {calculateWeeklyStatus(goal).isBehind && (
                                                    <span className="text-[10px] opacity-70 flex items-center gap-1 mt-1">
                                                        <AlertCircle className="w-3 h-3" /> Incluye saldo acumulado de semanas anteriores
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="col-span-full bg-[var(--card)] border border-dashed border-[var(--card-border)] rounded-2xl p-12 text-center">
                                <p className="text-[var(--muted)] text-sm">Aún no has creado metas de ahorro.</p>
                            </div>
                        )}
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

export default Goals;
