import React, { useState } from 'react';
import { X, Target, DollarSign, Calendar, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface EditGoalModalProps {
    isOpen: boolean;
    goal: any;
    onClose: () => void;
    onGoalUpdated: () => void;
}

/**
 * Modal de Edición de Metas de Ahorro
 * Permite editar nombre, monto objetivo, monto actual y fecha de culminación.
 */
const EditGoalModal: React.FC<EditGoalModalProps> = ({
    isOpen,
    goal,
    onClose,
    onGoalUpdated
}) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Precargar datos al abrir el modal
    React.useEffect(() => {
        if (isOpen && goal) {
            setName(goal.name);
            setTargetAmount(goal.target_amount.toString());
            setCurrentAmount(goal.current_amount.toString());
            setEndDate(goal.end_date.split('T')[0]);
            setError(null);
        }
    }, [isOpen, goal]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (Number(currentAmount) > Number(targetAmount)) {
            setError('El monto actual no puede ser mayor al monto objetivo.');
            setLoading(false);
            return;
        }

        try {
            await api.patch(`/savings-goals/${goal.id}`, {
                name,
                targetAmount: Number(targetAmount),
                initialAmount: Number(currentAmount),
                endDate
            });

            onGoalUpdated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar la meta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={() => !loading && onClose()}
            />

            {/* Modal */}
            <div className="relative bg-[var(--card)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[var(--card-border)]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                                Editar Meta
                            </h2>
                            <p className="text-[var(--muted)] text-xs mt-1">
                                Actualiza la información de tu meta financiera.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-1.5 hover:bg-[var(--background)] rounded-lg text-[var(--muted)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">
                                Nombre de la meta
                            </label>
                            <div className="relative">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Monto Objetivo */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">
                                Monto Objetivo
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Fecha límite */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">
                                Fecha de culminación
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-3 px-4 border border-[var(--card-border)] text-[var(--muted)] font-bold rounded-xl hover:bg-[var(--background)] transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-[var(--card-border)] flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGoalModal;
