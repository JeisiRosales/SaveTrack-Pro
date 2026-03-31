import React, { useState, useEffect } from 'react';
import { ExpenseCategorySelector } from '@/features/expense/components/ExpenseCategorySelector';
import { useGlobalSettings } from '@/context/SettingsContext';
import { createFixedExpense, updateFixedExpense } from '../api/fixed.api';
import { FixedExpense } from '../types';
import { X, Loader2, Calendar, AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expenseToEdit?: FixedExpense | null;
}

const INITIAL = { name: '', amount: '', catId: '', billingDay: '1' };

export const CreateFixedExpenseModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSuccess,
    expenseToEdit
}) => {
    const { currencySymbol } = useGlobalSettings();

    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (expenseToEdit) {
                setForm({
                    name: expenseToEdit.name,
                    amount: expenseToEdit.amount.toString(),
                    catId: expenseToEdit.category_id,
                    billingDay: expenseToEdit.billing_day.toString()
                });
            } else {
                setForm(INITIAL);
            }
            setError('');
            setSuccess(false);
        }
    }, [isOpen, expenseToEdit]);

    if (!isOpen) return null;

    const validate = (): string => {
        if (!form.name.trim()) return 'Ingresa un nombre para el compromiso.';
        if (!form.catId) return 'Selecciona una categoría fija.';
        if (!form.amount || Number(form.amount) <= 0) return 'Ingresa un monto válido.';
        const day = Number(form.billingDay);
        if (isNaN(day) || day < 1 || day > 31) return 'El día de cobro debe estar entre 1 y 31.';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                amount: Number(form.amount),
                billing_day: Number(form.billingDay),
                category_id: form.catId,
                is_active: true
            };

            if (expenseToEdit) {
                await updateFixedExpense(expenseToEdit.id, payload);
            } else {
                await createFixedExpense(payload);
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el compromiso fijo');
        } finally {
            setLoading(false);
        }
    };

    const set = (key: keyof typeof INITIAL) =>
        (val: string) => { setForm(f => ({ ...f, [key]: val })); setError(''); };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose()} />

            <div className="relative bg-[var(--card)] w-full max-w-md rounded-3xl p-8 border border-[var(--card-border)] shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-black text-[var(--foreground)]">
                            {expenseToEdit ? 'Editar Compromiso' : 'Nuevo Compromiso'}
                        </h2>
                        <p className="text-xs text-[var(--muted)] mt-1 font-medium">
                            {expenseToEdit ? 'Modifica los detalles de tu gasto.' : 'Define un gasto fijo mensual.'}
                        </p>
                    </div>
                    <button onClick={() => !loading && onClose()} className="p-2 hover:bg-[var(--background)] rounded-full transition-colors">
                        <X className="text-[var(--muted)] w-5 h-5" />
                    </button>
                </div>

                {/* Status Banners */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p>¡Compromiso guardado!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[var(--muted)] ml-1 uppercase tracking-widest">Nombre del Compromiso</label>
                        <input
                            type="text"
                            placeholder="Ej. Renta, Netflix, Gimnasio..."
                            value={form.name}
                            onChange={(e) => set('name')(e.target.value)}
                            className="w-full px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-[var(--muted)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Monto */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[var(--muted)] ml-1 uppercase tracking-widest">Monto</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm">{currencySymbol}</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={e => {
                                        const val = e.target.value.replace(',', '.');
                                        // Validamos que solo sean números y un punto
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            set('amount')(val);
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Día de Cobro */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[var(--muted)] ml-1 uppercase tracking-widest">Día de Cobro</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm"><Calendar className="w-4 h-4" /></span>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={form.billingDay}
                                    onChange={(e) => set('billingDay')(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[var(--muted)] ml-1 uppercase tracking-widest">Categoría de Gasto</label>
                        <ExpenseCategorySelector
                            selectedId={form.catId}
                            onSelect={set('catId')}
                            filterType="fixed"
                        />
                        <p className="text-[9px] text-[var(--muted)] font-semibold px-1 italic">* Solo se muestran categorías marcadas como "Fijas".</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (expenseToEdit ? 'Guardar Cambios' : 'Registrar Compromiso')}
                    </button>
                </form>
            </div>
        </div>
    );
};
