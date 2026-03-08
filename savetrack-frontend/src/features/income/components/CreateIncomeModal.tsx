import React, { useState, useEffect } from 'react';
import { useIncomeTransactions } from '../hooks/useIncomeTransactions';
import { X, Loader2, AlertCircle, PiggyBank, ArrowLeftRight } from 'lucide-react';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { IncomeCategorySelector } from '@/features/income/components/IncomeCategorySelector';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useGlobalSettings } from '@/context/SettingsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL = { amount: '', desc: '', accountId: '', catId: '', autoSave: false };

const friendlyError = (err: any): string => {
    const msg = (err?.response?.data?.message || err?.message || '').toLowerCase();
    if (msg.includes('account') && msg.includes('not found'))
        return 'La cuenta seleccionada no existe o fue eliminada.';
    if (msg.includes('category') && msg.includes('not found'))
        return 'La categoría seleccionada ya no está disponible.';
    if (msg.includes('amount'))
        return 'El monto ingresado no es válido.';
    if (msg.includes('network') || msg.includes('fetch'))
        return 'Sin conexión. Verifica tu internet e intenta de nuevo.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
};

export const CreateIncomeModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { add } = useIncomeTransactions();
    const { accounts } = useAccounts();
    const { currencySymbol, settings } = useGlobalSettings();
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const savingPercentage = settings?.saving_percentage || 0;
    const amountValue = Number(form.amount) || 0;
    // Calculamos cuánto se desvía y cuánto queda
    const savingAmount = (amountValue * (savingPercentage / 100));
    const remainingAmount = amountValue - savingAmount;
    // Verificamos si la configuración global está activa
    const isAutoSaveGloballyEnabled = settings?.auto_save_enabled && settings?.savings_account_id;

    // Limpia el formulario cada vez que el modal se abre o cierra
    useEffect(() => {
        if (!isOpen) {
            setForm(INITIAL);
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = (): string => {
        if (!form.accountId) return 'Selecciona una cuenta de destino.';
        if (!form.catId) return 'Selecciona una categoría para el ingreso.';
        if (!form.amount) return 'Ingresa un monto.';
        if (Number(form.amount) <= 0) return 'El monto debe ser mayor a cero.';
        if (Number(form.amount) < 0.01) return 'El monto mínimo es 0.01.';
        return '';
    };

    const set = (key: keyof typeof INITIAL) =>
        (val: string | boolean) => { setForm(f => ({ ...f, [key]: val })); setError(''); };

    const fmt = (value: number) => {
        return `${currencySymbol}${value.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            // 1. Verificamos si debemos aplicar el ahorro (global o manual)
            // y si existe una cuenta destino configurada
            const shouldApplySavings = (isAutoSaveGloballyEnabled || form.autoSave) && settings?.savings_account_id;

            if (shouldApplySavings) {
                // A. Registramos el remanente en la cuenta principal
                await add({
                    account_id: form.accountId,
                    category_id: form.catId || undefined,
                    amount: remainingAmount,
                    description: form.desc
                });

                // B. Registramos el porcentaje desviado en la cuenta de ahorro
                await add({
                    account_id: settings?.savings_account_id || '',
                    category_id: form.catId || undefined,
                    amount: savingAmount,
                    description: `Ahorro Automático: ${form.desc}` // Identificador visual
                });
            } else {
                // Flujo normal: todo el dinero va a la cuenta principal
                await add({
                    account_id: form.accountId,
                    category_id: form.catId || undefined,
                    amount: amountValue,
                    description: form.desc
                });
            }

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !loading && onClose()} />

            <div className="relative bg-[var(--card)] w-full max-w-md rounded-3xl p-8 border border-[var(--card-border)] shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Registrar Ingreso</h2>
                        <p className="text-xs text-[var(--muted)] mt-1">
                            Añade fondos a tu cuenta y activa el ahorro automático.
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

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in fade-in slide-in-from-top-2 duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold leading-snug">{error}</p>
                    </div>
                )}

                {/* Éxito */}
                {success && (
                    <div className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold">¡Ingreso registrado correctamente!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Cuenta */}
                    <AccountSelector
                        label="Cuenta de Destino"
                        accounts={accounts || []}
                        selectedId={form.accountId}
                        onSelect={val => set('accountId')(val)}
                        placeholder="Selecciona cuenta receptora"
                    />

                    {/* Categoría */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                            Categoría
                        </label>
                        <IncomeCategorySelector
                            selectedId={form.catId}
                            onSelect={val => set('catId')(val)}
                        />
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-emerald-500/40">
                                {currencySymbol}
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => set('amount')(e.target.value)}
                                className="text-[var(--foreground)] text-sm w-full pl-12 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-[var(--card)] transition-all outline-none"
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
                            placeholder="Ej. Pago de Nómina, Venta..."
                            value={form.desc}
                            onChange={e => set('desc')(e.target.value)}
                            className="text-[var(--foreground)] text-sm w-full px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-[var(--card)] transition-all outline-none"
                        />
                    </div>

                    {/* Sección de Ahorro Dinámica */}
                    <div className="space-y-3">
                        {isAutoSaveGloballyEnabled ? (
                            /* ESCENARIO A: Configuración Global Activa (Informativo) */
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
                                    <PiggyBank className="w-16 h-16 text-emerald-500" />
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Ahorro Automático Activo</p>
                                        <p className="text-sm font-bold text-white">
                                            Se desviará el {savingPercentage}% de este ingreso
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-400">+{fmt(savingAmount)}</p>
                                        <p className="text-[9px] text-emerald-500/60 font-medium">A tu cuenta de ahorro</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                                    <span className="text-[10px] text-[var(--muted)] font-medium italic">
                                        Quedarán {fmt(remainingAmount)} en la cuenta principal
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                        Regla Activa
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* ESCENARIO B: No está configurado (Ofrecer la oportunidad) */
                            <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border group ${form.autoSave
                                ? 'bg-indigo-500/10 border-indigo-500/30'
                                : 'bg-[var(--background)] border-[var(--card-border)] hover:border-indigo-500/20'
                                }`}>
                                <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <ArrowLeftRight className={`w-5 h-5 ${form.autoSave ? 'text-indigo-400' : 'text-[var(--muted)]'}`} />
                                </div>

                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${form.autoSave ? 'text-indigo-400' : 'text-[var(--foreground)]'}`}>
                                        ¿Deseas ahorrar una parte?
                                    </p>
                                    <p className="text-[10px] text-[var(--muted)] leading-tight mt-0.5">
                                        Activa esto para desviar manualmente un porcentaje de este ingreso específico.
                                    </p>
                                </div>

                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.autoSave}
                                        onChange={e => set('autoSave')(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                    >
                        {loading
                            ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            : 'Confirmar Ingreso'
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};