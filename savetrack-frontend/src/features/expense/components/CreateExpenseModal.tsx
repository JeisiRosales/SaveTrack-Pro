import React, { useState, useEffect } from 'react';
import { useExpenseTransactions } from '@/features/expense/hooks/useExpenseTransactions';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { ExpenseCategorySelector } from '@/features/expense/components/ExpenseCategorySelector';
import { useGlobalSettings } from '@/context/SettingsContext';
import { X, Loader2, Repeat, Zap, AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL = { amount: '', desc: '', accountId: '', catId: '' };

// Traduce errores del backend a mensajes amigables
const friendlyError = (err: any): string => {
    const msg = (err?.response?.data?.message || err?.message || '').toLowerCase();
    if (msg.includes('account') && msg.includes('not found'))
        return 'La cuenta seleccionada no existe o fue eliminada.';
    if (msg.includes('category') && msg.includes('not found'))
        return 'La categoría seleccionada ya no está disponible.';
    if (msg.includes('insufficient') || msg.includes('balance'))
        return 'Saldo insuficiente en la cuenta seleccionada.';
    if (msg.includes('amount'))
        return 'El monto ingresado no es válido.';
    if (msg.includes('network') || msg.includes('fetch'))
        return 'Sin conexión. Verifica tu internet e intenta de nuevo.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
};

export const CreateExpenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { add } = useExpenseTransactions();
    const { categories } = useExpenseCategories();
    const { accounts } = useAccounts();
    const { currencySymbol } = useGlobalSettings();

    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Limpia el formulario cada vez que el modal se abre o cierra
    useEffect(() => {
        if (!isOpen) {
            setForm(INITIAL);
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const selectedCategory = categories.find(c => c.id === form.catId);
    const isFixed = selectedCategory?.is_fixed ?? null;

    // Validaciones locales
    const validate = (): string => {
        if (!form.accountId) return 'Selecciona una cuenta de origen.';
        if (!form.catId) return 'Selecciona una categoría para el gasto.';
        if (!form.amount) return 'Ingresa un monto.';
        if (Number(form.amount) <= 0) return 'El monto debe ser mayor a cero.';
        if (Number(form.amount) < 0.01) return 'El monto mínimo es 0.01.';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            await add({
                account_id: form.accountId,
                category_id: form.catId || undefined,
                amount: Number(form.amount),
                description: form.desc,
            });
            setSuccess(true);
            setTimeout(() => {
                setForm(INITIAL);
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    const set = (key: keyof typeof INITIAL) =>
        (val: string) => { setForm(f => ({ ...f, [key]: val })); setError(''); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !loading && onClose()} />

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
                        type="button"
                        onClick={() => !loading && onClose()}
                        className="p-2 hover:bg-[var(--background)] rounded-full transition-colors"
                    >
                        <X className="text-[var(--muted)] w-5 h-5" />
                    </button>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in fade-in slide-in-from-top-2 duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold leading-snug">{error}</p>
                    </div>
                )}

                {/* Success banner */}
                {success && (
                    <div className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold">¡Gasto registrado correctamente!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Cuenta */}
                    <AccountSelector
                        label="Cuenta de Origen"
                        accounts={accounts || []}
                        selectedId={form.accountId}
                        onSelect={set('accountId')}
                        placeholder="Selecciona cuenta de débito"
                    />

                    {/* Categoría */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[11px] font-black text-[var(--muted)] uppercase">
                                Categoría
                            </label>
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
                        <ExpenseCategorySelector selectedId={form.catId} onSelect={set('catId')} />
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm">
                                {currencySymbol}
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => set('amount')(e.target.value)}
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
                            value={form.desc}
                            onChange={e => set('desc')(e.target.value)}
                            className="text-[var(--foreground)] text-sm w-full px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-rose-600 focus:bg-[var(--card)] transition-all outline-none"
                        />
                    </div>

                    {/* Preview fijo/variable */}
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white p-4 rounded-2xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
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