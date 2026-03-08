import React, { useState } from 'react';
import { useExpenseTransactions } from '@/features/expense/hooks/useExpenseTransactions';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { ExpenseCategorySelector } from '@/features/expense/components/ExpenseCategorySelector';
import { useGlobalSettings } from '@/context/SettingsContext';
import { X, Loader2, Repeat, Zap } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal para registrar gastos — fijos y variables.
 * La clasificación fijo/variable se deriva automáticamente
 * del campo is_fixed de la categoría seleccionada.
 */
export const CreateExpenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { add } = useExpenseTransactions();
    const { categories } = useExpenseCategories();
    const { accounts } = useAccounts();
    const { currencySymbol } = useGlobalSettings();

    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [accountId, setAccountId] = useState('');
    const [catId, setCatId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Detecta si la categoría seleccionada es fija para feedback visual
    const selectedCategory = categories.find(c => c.id === catId);
    const isFixed = selectedCategory?.is_fixed ?? null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await add({
                account_id: accountId,
                category_id: catId || undefined,
                amount: Number(amount),
                description: desc,
            });
            // Resetear campos
            setAmount('');
            setDesc('');
            setCatId('');
            onClose();
        } catch (err) {
            console.error('Error al registrar gasto:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo difuminado */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Contenedor modal */}
            <div className="relative bg-[var(--card)] w-full max-w-md rounded-3xl p-8 border border-[var(--card-border)] shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Registrar Gasto</h2>
                        <p className="text-xs text-[var(--muted)] mt-1">
                            La categoría determina si es fijo o variable.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="text-[var(--muted)] w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">

                        {/* Cuenta */}
                        <AccountSelector
                            label="Cuenta de Origen"
                            accounts={accounts || []}
                            selectedId={accountId}
                            onSelect={setAccountId}
                            placeholder="Selecciona cuenta de débito"
                        />

                        {/* Categoría con indicador fijo/variable */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[11px] font-black text-[var(--muted)] uppercase">
                                    Categoría
                                </label>
                                {/* Badge dinámico según categoría seleccionada */}
                                {isFixed !== null && (
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isFixed
                                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}>
                                        {isFixed
                                            ? <><Repeat className="w-2.5 h-2.5" /> Gasto Fijo</>
                                            : <><Zap className="w-2.5 h-2.5" /> Gasto Variable</>
                                        }
                                    </span>
                                )}
                            </div>
                            <ExpenseCategorySelector
                                selectedId={catId}
                                onSelect={setCatId}
                            />
                        </div>

                        {/* Monto */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                                Monto
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-rose-500/50">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="text-[var(--foreground)] text-sm w-full pl-12 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-rose-600 focus:bg-[var(--card)] transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                                Concepto / Descripción
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Supermercado, Netflix, Gasolina..."
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="text-[var(--foreground)] text-sm w-full px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-rose-600 focus:bg-[var(--card)] transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Preview del tipo de gasto */}
                    {isFixed !== null && (
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isFixed
                                ? 'bg-violet-500/5 border-violet-500/20'
                                : 'bg-orange-500/5 border-orange-500/20'
                            }`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isFixed ? 'bg-violet-500/20' : 'bg-orange-500/20'
                                }`}>
                                {isFixed
                                    ? <Repeat className="w-4 h-4 text-violet-400" />
                                    : <Zap className="w-4 h-4 text-orange-400" />
                                }
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${isFixed ? 'text-violet-400' : 'text-orange-400'}`}>
                                    {isFixed ? 'Gasto Fijo' : 'Gasto Variable'}
                                </p>
                                <p className="text-[10px] text-[var(--muted)] leading-tight">
                                    {isFixed
                                        ? 'Se repite periódicamente. Ej: suscripciones, arriendo.'
                                        : 'Varía cada período. Ej: comida, transporte, ocio.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Botón submit */}
                    <button
                        disabled={loading || !accountId}
                        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:grayscale font-bold text-white p-4 rounded-2xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
                    >
                        {loading
                            ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            : 'Confirmar Gasto'
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};