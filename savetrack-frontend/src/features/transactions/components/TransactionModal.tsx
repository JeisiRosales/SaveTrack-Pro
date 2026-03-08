import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Loader2, ArrowRightLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import * as transactionsApi from '../api/transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Account } from '@/features/accounts/types';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { useGlobalSettings } from '@/context/SettingsContext';

// Interfaz para las propiedades del modal de transacciones
interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | undefined;
    onSuccess: () => void;
}

// Componente de modal para transacciones
export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, goalId, onSuccess }) => {
    const { currencySymbol } = useGlobalSettings();
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

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

            // Invalidar cachés
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });

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
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Movimiento de Meta</h2>
                            <p className="text-[var(--muted)] text-xs mt-1">Registra un depósito o retiro para este objetivo.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-[var(--background)] rounded-lg text-[var(--muted)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Toggle Tipo de Transacción */}
                    <div className="flex p-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setType('deposit')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'deposit'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            <Plus className="w-4 h-4" /> Depósito
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('withdrawal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'withdrawal'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            <Minus className="w-4 h-4" /> Retiro
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 text-rose-500 rounded-2xl text-sm border border-rose-500/20 flex items-center gap-3">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selector de Cuenta */}
                        <label className="text-[var(--muted)] text-xs mt-1 uppercase font-semibold">
                            Cuenta Vinculada
                        </label>
                        <AccountSelector
                            placeholder="Selecciona la cuenta para el movimiento"
                            accounts={accounts}
                            selectedId={accountId}
                            onSelect={(id) => setAccountId(id)} label={''} />

                        {/* Input Monto */}
                        <div>
                            <label className="text-[var(--muted)] text-xs mt-1 uppercase font-semibold">
                                Monto a {type === 'deposit' ? 'depositar' : 'retirar'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-[var(--accent-text)] opacity-50">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-12 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--card)] transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        {/* Botón de Confirmación */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm ${type === 'deposit'
                                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                    } active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100`}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-4 h-4 mr-1" />
                                        Confirmar {type === 'deposit' ? 'Depósito' : 'Retiro'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
