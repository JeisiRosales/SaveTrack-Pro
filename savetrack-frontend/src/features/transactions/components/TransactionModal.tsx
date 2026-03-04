import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import * as transactionsApi from '../api/transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Account } from '@/features/accounts/types';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';

// Interfaz para las propiedades del modal de transacciones
interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | undefined;
    onSuccess: () => void;
}

// Componente de modal para transacciones
export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, goalId, onSuccess }) => {
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hook para obtener cuentas cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            getAccounts().then(res => setAccounts(res.data));
            setError(null);
        }
    }, [isOpen]);

    // Maneja el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) {
            setError('Por favor selecciona una cuenta');
            return;
        }

        setLoading(true);
        try {
            await transactionsApi.createTransaction({
                goalId,
                accountId,
                type,
                amount: Number(amount)
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error en la transacción');
        } finally {
            setLoading(false);
        }
    };

    // Renderiza el modal si está abierto
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#12141c] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Movimiento</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Toggle Tipo */}
                    <div className="flex p-1.5 bg-black/20 border border-white/5 rounded-2xl mb-4 mt-4">
                        <button
                            type="button"
                            onClick={() => setType('deposit')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'deposit' ? 'bg-[#4f46e5] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Plus className="w-4 h-4" /> Depósito
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('withdrawal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'withdrawal' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Minus className="w-4 h-4" /> Retiro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AccountSelector
                            label="Cuenta de origen"
                            placeholder="¿De dónde viene el dinero?"
                            accounts={accounts}
                            selectedId={accountId}
                            onSelect={(id) => setAccountId(id)}
                        />

                        {/* Input Monto */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 ml-1 uppercase">Monto a transferir</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-white text-sm font-semibold w-full flex items-center justify-between bg-black/20 border border-white/10 mt-0.5 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-xs text-white shadow shadow-indigo-500/10 transition-all active:scale-95 flex items-center justify-center gap-3 ${type === 'deposit'
                                ? 'bg-[#4f46e5] hover:bg-[#4338ca] shadow-indigo-500/20'
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferencia'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
