import React, { useState } from 'react';
import { X, Wallet, DollarSign, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccountCreated: () => void;
}

/**
 * Modal de Creación de Cuentas de Financiamiento
 * Proporciona un formulario premium para agregar nuevas fuentes de capital.
 */
const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onAccountCreated }) => {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Resetear el formulario cuando el modal se abre o se cierra
    React.useEffect(() => {
        if (!isOpen) {
            setName('');
            setBalance('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/funding-accounts', {
                name,
                balance: Number(balance)
            });

            onAccountCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta de nuevo.');
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
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nueva Cuenta</h2>
                            <p className="text-slate-500 text-xs mt-1">Registra una nueva fuente de ahorro.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
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
                        {/* Nombre de la Cuenta */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2 ml-1">Nombre de la Cuenta</label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Cuenta de Ahorros, Efectivo, Nómina..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-slate-900 text-sm w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Balance Inicial */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2 ml-1">Saldo Inicial</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    className="text-slate-900 text-sm w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    'Crear Cuenta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAccountModal;
