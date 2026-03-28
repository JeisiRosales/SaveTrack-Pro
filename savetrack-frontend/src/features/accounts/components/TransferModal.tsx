import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Account, TransferForm } from '../types';
import { AccountSelector } from './AccountSelector';
import { useGlobalSettings } from '@/context/SettingsContext';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    statusMessage: { text: string; type: 'success' | 'error' | null };
    isTransferring: boolean;
    onTransfer: (data: TransferForm) => Promise<boolean>;
}

export const TransferModal: React.FC<TransferModalProps> = ({
    isOpen, onClose, accounts, statusMessage, isTransferring, onTransfer,
}) => {
    const { currencySymbol } = useGlobalSettings();

    const transferableAccounts = accounts;
    const [form, setForm] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '' as string | number
    });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (!isOpen) { 
            setForm({ fromAccountId: '', toAccountId: '', amount: '' }); 
            setLocalError(''); 
        }
    }, [isOpen]);

    // Cuenta de origen seleccionada (para validar saldo)
    const fromAccount = accounts.find(a => a.id === form.fromAccountId);
    const amountNum = Number(form.amount) || 0;

    // Validaciones en tiempo real
    const sameAccount = form.fromAccountId && form.toAccountId && form.fromAccountId === form.toAccountId;
    const exceedsBalance = fromAccount && amountNum > 0 && amountNum > fromAccount.balance;
    const belowMinimum = amountNum > 0 && amountNum < 0.01;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Validaciones locales antes de llamar a la API
        if (!form.fromAccountId) { setLocalError('Selecciona una cuenta de origen.'); return; }
        if (!form.toAccountId) { setLocalError('Selecciona una cuenta de destino.'); return; }
        if (form.fromAccountId === form.toAccountId) {
            setLocalError('La cuenta de origen y destino no pueden ser la misma.'); return;
        }
        if (!amountNum || amountNum <= 0) { setLocalError('Ingresa un monto válido mayor a cero.'); return; }
        if (exceedsBalance) {
            setLocalError(`Saldo insuficiente. Tu cuenta "${fromAccount!.name}" solo tiene ${currencySymbol}${fromAccount!.balance.toLocaleString()}.`);
            return;
        }

        const success = await onTransfer({
            ...form,
            amount: amountNum
        } as TransferForm);
        if (success) setTimeout(onClose, 2000);
    };

    // Mensaje de error a mostrar: local o del backend (traducido)
    const errorText = localError || (statusMessage.type === 'error' ? statusMessage.text : '');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => !isTransferring && onClose()}
            />

            <div className="relative w-full max-w-md bg-[var(--card)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--card-border)] animate-in fade-in zoom-in duration-300">
                <div className="p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)]">Transferir Saldo</h3>
                            <p className="text-xs text-[var(--muted)] mt-1 font-medium">
                                Mueve fondos entre tus cuentas de ahorro.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--background)] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--muted)]" />
                        </button>
                    </div>

                    {/* Mensaje de éxito */}
                    {statusMessage.type === 'success' && (
                        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{statusMessage.text}</p>
                        </div>
                    )}

                    {/* Mensaje de error (local o del backend) */}
                    {errorText && (
                        <div className="mb-5 p-4 rounded-2xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold leading-snug">{errorText}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Cuenta origen */}
                        <AccountSelector
                            label="Origen"
                            placeholder="¿De dónde sale el dinero?"
                            accounts={transferableAccounts}
                            selectedId={form.fromAccountId}
                            onSelect={id => { setForm({ ...form, fromAccountId: id }); setLocalError(''); }}
                            includeSavings
                        />

                        {/* Cuenta destino */}
                        <AccountSelector
                            label="Destino"
                            placeholder="¿A dónde va el dinero?"
                            accounts={transferableAccounts.filter(acc => acc.id !== form.fromAccountId)}
                            selectedId={form.toAccountId}
                            onSelect={id => { setForm({ ...form, toAccountId: id }); setLocalError(''); }}
                            includeSavings
                        />

                        {/* Monto */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                                Monto a Transferir
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className={`w-full bg-[var(--input-bg)] border rounded-2xl p-4 pl-10 text-sm font-bold text-[var(--foreground)] outline-none transition-all focus:ring-2 ${exceedsBalance
                                        ? 'border-rose-500/50 focus:ring-rose-500/30'
                                        : 'border-[var(--input-border)] focus:ring-indigo-500/50'
                                        }`}
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={e => {
                                        const val = e.target.value.replace(',', '.');
                                        // Validamos que solo sean números y un punto
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setForm({ ...form, amount: val });
                                            setLocalError('');
                                        }
                                    }}
                                />
                            </div>

                            {/* Advertencias inline bajo el input */}
                            {exceedsBalance && (
                                <p className="text-xs font-bold text-rose-400 ml-1">
                                    El monto supera el saldo disponible ({currencySymbol}{fromAccount!.balance.toLocaleString()}).
                                </p>
                            )}
                            {belowMinimum && (
                                <p className="text-xs font-bold text-amber-400 ml-1">
                                    El monto mínimo es {currencySymbol}0.01.
                                </p>
                            )}

                            {/* Botón de transferir todo */}
                            {fromAccount && fromAccount.balance > 0 && !exceedsBalance && (
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, amount: fromAccount.balance })}
                                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 ml-1 transition-colors"
                                >
                                    Transferir todo ({currencySymbol}{fromAccount.balance.toLocaleString()}) →
                                </button>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isTransferring || !!exceedsBalance || !!sameAccount}
                            className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                        >
                            {isTransferring
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : 'Confirmar Transferencia'
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};