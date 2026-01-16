import React, { useState } from 'react';
import { X, Target, DollarSign, Calendar, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoalCreated: () => void;
}

/**
 * Modal de Creación de Metas de Ahorro
 * Proporciona un formulario premium para crear nuevos objetivos financieros.
 */
const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose, onGoalCreated }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [initialAmount, setInitialAmount] = useState('0');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Resetear el formulario cuando el modal se abre o se cierra
    React.useEffect(() => {
        if (!isOpen) {
            setName('');
            setTargetAmount('');
            setInitialAmount('0');
            setEndDate('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const startDate = new Date().toISOString().split('T')[0];
            await api.post('/savings-goals', {
                name,
                targetAmount: Number(targetAmount),
                initialAmount: Number(initialAmount),
                startDate,
                endDate
            });

            onGoalCreated();
            onClose();
            // Reset form
            setName('');
            setTargetAmount('');
            setInitialAmount('0');
            setEndDate('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la meta. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop con blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Contenedor del Modal */}
            <div className="relative bg-[var(--card)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[var(--card-border)]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Nueva Meta</h2>
                            <p className="text-[var(--muted)] text-xs mt-1">Define tu próximo gran objetivo.</p>
                        </div>
                        <button
                            onClick={onClose}
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
                        {/* Nombre de la Meta */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">¿Qué quieres lograr?</label>
                            <div className="relative">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Viaje a Japón, Fondo de Emergencia..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Monto Objetivo */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">Monto Objetivo</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="1"
                                        placeholder="0.00"
                                        value={targetAmount}
                                        onChange={
                                            (e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                    setTargetAmount(val);
                                                }
                                            }
                                        }
                                        className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>

                            {/* Ahorro Inicial */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">Ya tengo ahorrado</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={initialAmount}
                                        onChange={
                                            (e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                    setInitialAmount(val);
                                                }
                                            }
                                        }
                                        className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fecha Límite */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] opacity-80 mb-2 ml-1">¿Para cuándo lo necesitas?</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
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
                                        Creando...
                                    </>
                                ) : (
                                    'Comenzar Meta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGoalModal;
