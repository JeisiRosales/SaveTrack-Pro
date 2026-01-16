import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { Target, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

/**
 * PÁGINA DE METAS
 * Permite a los usuarios visualizar y gestionar sus metas de ahorro.
 */
const Goals: React.FC = () => {
    const { } = useAuth();
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
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-600" />
                            Mis Metas
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Gestiona tus objetivos financieros a largo plazo.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.length > 0 ? (
                            goals.map((goal) => (
                                <div key={goal.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{goal.name}</h4>
                                    <div className="flex items-baseline gap-1.5 mb-3">
                                        <span className="text-base font-bold text-indigo-600">${goal.current_amount?.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400">/ ${goal.target_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
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
