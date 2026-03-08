import React, { useState } from 'react';
import { X, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Account, TransferForm } from '../types';
import { AccountSelector } from './AccountSelector';
import { useGlobalSettings } from '@/context/SettingsContext';

// Interfaz para las propiedades del modal de transferencia
interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    statusMessage: { text: string; type: 'success' | 'error' | null };
    isTransferring: boolean;
    onTransfer: (data: TransferForm) => Promise<boolean>;
}

// Componente para transferir fondos
export const TransferModal: React.FC<TransferModalProps> = ({
    isOpen,
    onClose,
    accounts,
    statusMessage,
    isTransferring,
    onTransfer
}) => {
    const { currencySymbol } = useGlobalSettings();
    const [form, setForm] = useState<TransferForm>({
        fromAccountId: '',
        toAccountId: '',
        amount: 0
    });

    // Manejamos el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onTransfer(form);
        if (success) {
            setTimeout(() => {
                onClose();
            }, 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => !isTransferring && onClose()}
            />

            <div className="relative w-full max-w-md bg-[var(--card)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--card-border)] animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)]">Transferir Saldo</h3>
                            <p className="text-xs text-[var(--muted)] mt-1 font-medium">Mueve fondos entre tus cuentas de ahorro.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--background)] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--muted)]" />
                        </button>
                    </div>

                    {statusMessage.type && (
                        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${statusMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                            }`}>
                            {statusMessage.type === 'success' ? (
                                <div className="bg-emerald-500 text-white rounded-full p-1">
                                    <Plus className="w-3 h-3" />
                                </div>
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            <p className="text-sm font-bold">{statusMessage.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AccountSelector
                            label="Origen"
                            placeholder="¿De dónde sale el dinero?"
                            accounts={accounts}
                            selectedId={form.fromAccountId}
                            onSelect={(id) => setForm({ ...form, fromAccountId: id })}
                        />

                        <AccountSelector
                            label="Destino"
                            placeholder="¿A dónde va el dinero?"
                            accounts={accounts.filter(acc => acc.id !== form.fromAccountId)}
                            selectedId={form.toAccountId}
                            onSelect={(id) => setForm({ ...form, toAccountId: id })}
                        />

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">Monto a Transferir</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold">{currencySymbol}</span>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl p-4 pl-8 text-sm font-bold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="0.00"
                                    value={form.amount || ''}
                                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isTransferring}
                            className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                        >
                            {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferencia'}
                        </button>
                    </form>
                </div>
            </div>
        </div >
    );
};
