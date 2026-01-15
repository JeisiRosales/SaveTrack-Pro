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
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 sm:p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nueva Meta</h2>
                            <p className="text-[var(--muted)] text-sm mt-1">Define tu próximo gran objetivo.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
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
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">¿Qué quieres lograr?</label>
                            <div className="relative">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Viaje a Japón, Fondo de Emergencia..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-black w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Monto Objetivo */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Monto Objetivo</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                        className="text-black w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>

                            {/* Ahorro Inicial */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Ya tengo ahorrado</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                        className="text-black w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fecha Límite */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">¿Para cuándo lo necesitas?</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-black w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 px-6 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 px-6 bg-[var(--color-primary)] text-white font-black rounded-2xl hover:bg-[#3D46A9] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
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
