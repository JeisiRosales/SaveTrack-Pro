import React, { useState } from 'react';
import { useIncomeTransactions } from '../hooks/useIncomeTransactions';
import { X, Loader2 } from 'lucide-react';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { IncomeCategorySelector } from '@/features/income-categories/components/IncomeCategorySelector';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateIncomeModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { add } = useIncomeTransactions();
    const { accounts } = useAccounts();

    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [accountId, setAccountId] = useState('');
    const [catId, setCatId] = useState('');
    const [autoSave, setAutoSave] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await add({
                account_id: accountId,
                category_id: catId || undefined,
                amount: Number(amount),
                description: desc,
                perform_auto_save: autoSave
            });
            onClose();
        } catch (err) {
            console.error('Error al registrar ingreso:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[#0f111a] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Registrar Ingreso</h2>
                        <p className="text-xs text-gray-400 mt-1">Añade fondos a tu cuenta y activa el ahorro automático.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="text-gray-400 w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <AccountSelector
                            label="Cuenta de Origen"
                            accounts={accounts || []}
                            selectedId={accountId}
                            onSelect={setAccountId}
                            placeholder="Selecciona cuenta receptora"
                        />

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">Categoría</label>
                            <IncomeCategorySelector
                                selectedId={catId}
                                onSelect={setCatId}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">Monto del Ingreso</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                required
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 text-emerald-400 text-2xl font-bold rounded-2xl p-4 text-center placeholder:text-emerald-900 focus:border-emerald-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">Concepto / Descripción</label>
                            <input
                                type="text"
                                placeholder="Ej. Pago de Nómina, Venta..."
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-4 outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl cursor-pointer hover:bg-emerald-500/10 transition-all group">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">Ahorro Automático</p>
                            <p className="text-[10px] text-gray-500 leading-tight">Se descontará el % configurado en tus ajustes hacia tu meta.</p>
                        </div>
                        <div className="relative inline-block w-10 h-5">
                            <input
                                type="checkbox"
                                checked={autoSave}
                                onChange={e => setAutoSave(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                    </label>

                    <button
                        disabled={loading || !accountId}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale font-bold text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Ingreso'}
                    </button>
                </form>
            </div>
        </div>
    );
};
