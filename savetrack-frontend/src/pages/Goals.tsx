import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { Target, Loader2, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

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

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.length > 0 ? (
                            goals.map((goal) => {
                                const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
                                return (
                                    <div key={goal.id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">
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

                                        <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                                style={{ width: `${progress}%` }}
                                            />
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
            </main>
        </div>
    );
};

export default Goals;
