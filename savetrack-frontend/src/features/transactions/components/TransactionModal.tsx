import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Loader2, ArrowRightLeft, AlertCircle, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import * as transactionsApi from '../api/transactions.api';
import { getAccounts } from '@/features/accounts/api/accounts.api';
import { Account } from '@/features/accounts/types';
import { useGlobalSettings } from '@/context/SettingsContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | undefined;
    goalTarget: number;        // meta objetivo para validar monto en retiro
    goalCurrent: number;       // saldo actual de la meta
    onSuccess: () => void;
}

const friendlyError = (err: any): string => {
    const msg = (err?.response?.data?.message || err?.message || '').toLowerCase();
    if (msg.includes('insufficient') || msg.includes('balance'))
        return 'Saldo insuficiente en la cuenta seleccionada.';
    if (msg.includes('account') && msg.includes('not found'))
        return 'La cuenta seleccionada no está disponible.';
    if (msg.includes('amount'))
        return 'El monto ingresado no es válido.';
    if (msg.includes('network') || msg.includes('fetch'))
        return 'Sin conexión. Verifica tu internet e intenta de nuevo.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen, onClose, goalId, goalTarget, goalCurrent, onSuccess,
}) => {
    const { currencySymbol, settings } = useGlobalSettings();
    const queryClient = useQueryClient();
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Validaciones en tiempo real 
    const amountNum = Number(amount) || 0;
    const remaining = goalTarget - goalCurrent;
    const goalCompleted = remaining <= 0;
    const exceedsRemaining = type === 'deposit' && remaining > 0 && amountNum > remaining;
    const exceedsGoal = type === 'withdrawal' && amountNum > goalCurrent;
    const exceedsAccountBalance = type === 'deposit' && amountNum > (account?.balance ?? 0);
    const hasSavingsAccount = !!settings?.savings_account_id;

    useEffect(() => {
        if (!isOpen) { setAmount(''); setError(''); setType('deposit'); return; }

        // Carga cuentas y preselecciona la cuenta de ahorro configurada
        getAccounts().then(res => {
            const all: Account[] = res.data;
            const savingsId = settings?.savings_account_id;
            const preselected = savingsId
                ? all.find(a => a.id === savingsId) ?? null
                : null;
            setAccount(preselected);
        });
    }, [isOpen, settings?.savings_account_id]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!account) { setError('No hay una cuenta de ahorro configurada.'); return; }

        setLoading(true);
        try {
            await transactionsApi.createTransaction({
                goalId,
                accountId: account.id,
                type,
                amount: amountNum,
            });

            queryClient.invalidateQueries({ queryKey: ['goals'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

            onSuccess();
            onClose();
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !loading && onClose()} />

            <div className="relative bg-[var(--card)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[var(--card-border)]">
                <div className="p-6">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                                Movimiento de Meta
                            </h2>
                            <p className="text-[var(--muted)] text-xs mt-1">
                                Registra un depósito o retiro para este objetivo.
                            </p>
                        </div>
                        <button
                            onClick={() => !loading && onClose()}
                            className="p-1.5 hover:bg-[var(--background)] rounded-lg text-[var(--muted)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Toggle tipo */}
                    <div className="flex p-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl mb-6">
                        <button type="button" onClick={() => { setType('deposit'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'deposit' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            <Plus className="w-4 h-4" /> Depósito
                        </button>
                        <button type="button" onClick={() => { setType('withdrawal'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'withdrawal' ? 'bg-rose-600 text-white shadow-md' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            <Minus className="w-4 h-4" /> Retiro
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in fade-in duration-200">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold leading-snug">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Cuenta — bloqueada, solo muestra la preseleccionada */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider ml-1 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Cuenta Vinculada
                            </label>
                            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${account
                                ? 'bg-[var(--input-bg)] border-[var(--input-border)]'
                                : 'bg-rose-500/5 border-rose-500/20'
                                }`}>
                                {account ? (
                                    <>
                                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-indigo-500 text-xs font-black">
                                                {account.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[var(--foreground)] truncate">{account.name}</p>
                                            <p className="text-[10px] text-[var(--muted)] font-medium">
                                                {currencySymbol}{account.balance.toLocaleString()} disponible
                                            </p>
                                        </div>
                                        <Lock className="w-3.5 h-3.5 text-[var(--muted)] flex-shrink-0" />
                                    </>
                                ) : (
                                    <p className="text-sm text-rose-400 font-bold">
                                        Sin cuenta de ahorro configurada — ve a Ajustes.
                                    </p>
                                )}
                            </div>
                            {!hasSavingsAccount && (
                                <p className="text-xs text-[var(--muted)] ml-1">
                                    Configura tu cuenta de ahorro principal en{' '}
                                    <span className="text-indigo-400 font-bold">Ajustes → Auto-Ahorro</span>.
                                </p>
                            )}
                        </div>

                        {/* Monto */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-[var(--muted)] uppercase tracking-wider">
                                    Monto a {type === 'deposit' ? 'depositar' : 'retirar'}
                                </label>
                                {/* Contexto útil según tipo */}
                                {type === 'deposit' && remaining > 0 && (
                                    <span className="text-xs font-bold text-indigo-400">
                                        Falta: {currencySymbol}{remaining.toLocaleString()}
                                    </span>
                                )}
                                {type === 'withdrawal' && goalCurrent > 0 && (
                                    <span className="text-xs font-bold text-rose-400">
                                        Disponible en meta: {currencySymbol}{goalCurrent.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => { setAmount(e.target.value); setError(''); }}
                                    className={`text-[var(--foreground)] text-sm w-full pl-12 pr-4 py-4 bg-[var(--input-bg)] border rounded-xl focus:ring-2 transition-all outline-none font-bold ${exceedsRemaining || exceedsGoal
                                        ? 'border-rose-500/50 focus:ring-rose-500/30'
                                        : 'border-[var(--input-border)] focus:ring-indigo-600/40'
                                        }`}
                                />
                            </div>

                            {/* Validaciones */}
                            {exceedsRemaining && (
                                <p className="text-xs font-bold text-rose-400 ml-1">
                                    Supera lo que falta para completar la meta ({currencySymbol}{remaining.toLocaleString()}).
                                </p>
                            )}
                            {exceedsGoal && (
                                <p className="text-xs font-bold text-rose-400 ml-1">
                                    No puedes retirar más de {currencySymbol}{goalCurrent.toLocaleString()}.
                                </p>
                            )}
                            {exceedsAccountBalance && (
                                <p className="text-xs font-bold text-rose-400 ml-1">
                                    Saldo insuficiente. Tu cuenta solo tiene {currencySymbol}{account!.balance.toLocaleString()}.
                                </p>
                            )}

                            {/* Meta completada */}
                            {type === 'deposit' && goalCompleted && (
                                <p className="text-xs font-bold text-emerald-500 ml-1">
                                    ¡Meta completada! No puedes seguir depositando fondos
                                </p>
                            )}

                            {/* Atajo: depositar el monto exacto para completar la meta */}
                            {type === 'deposit' && remaining > 0 && !goalCompleted && (
                                <button
                                    type="button"
                                    onClick={() => { setAmount(String(remaining)); setError(''); }}
                                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 ml-1 transition-colors"
                                >
                                    Completar meta ({currencySymbol}{remaining.toLocaleString()}) →
                                </button>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading || !account || exceedsRemaining || exceedsGoal || exceedsAccountBalance || goalCompleted}
                                className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${type === 'deposit'
                                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                    }`}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-4 h-4" />
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