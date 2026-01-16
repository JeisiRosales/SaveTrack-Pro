import React from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate, useParams, Link } from 'react-router-dom'; // Agregamos useParams
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * PÁGINA DE DETALLES DE METAS
 * Recupera y muestra una meta específica basada en el ID de la URL.
 */
const GoalDetailsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // 1. Capturamos el ID de la URL (ej: /goals/123)

    // Cambiamos el estado para guardar UN objeto, no un array
    const [goal, setGoal] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Efecto para verificar autenticación
    React.useEffect(() => {
        if (!user && !loading) navigate('/login');
    }, [user, loading, navigate]);

    // 2. Efecto para cargar los datos de la meta específica
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

    // 3. Manejo de Estados de Carga y Error (UI Feedback)
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

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex justify-center p-4 transition-colors duration-300">
            <main className="w-full max-w-5xl p-6 lg:p-10 relative overflow-x-hidden">
                <header>
                    <Link to="/goals" className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Link>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                            {goal.name}
                        </h1>
                        <p className="text-[var(--muted)] text-sm mt-1">
                            Detalles de la meta financiera
                        </p>
                    </div>
                </header>

                {/* Aquí iría el Grid Dashboard que diseñamos en el paso anterior... */}
                {/* Puedes inyectar aquí current_amount, target_amount, etc. */}

            </main>
        </div>
    );
};

export default GoalDetailsPage;