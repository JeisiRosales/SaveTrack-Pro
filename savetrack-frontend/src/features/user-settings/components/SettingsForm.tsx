import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { UserSettings } from '../types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { DeleteAccountModal } from './DeleteAccountModal';
import {
    Trash2, Settings, Save, Loader2,
    DollarSign, Calendar, PiggyBank, AlertTriangle, LogOut,
} from 'lucide-react';

export const SettingsForm = () => {
    const { settings, saveSettings, loading } = useSettings();
    const { accounts, loading: loadingAccounts } = useAccounts();
    const { currencySymbol } = useGlobalSettings();
    const { logout } = useAuth();

    const [formData, setFormData] = useState<Partial<UserSettings>>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const onSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();
        setSaveSuccess(false);
        try {
            await saveSettings(formData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            alert('Error al guardar las configuraciones.');
        }
    };

    if (loading && !settings) return (
        <div className="text-[var(--muted)] flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin w-4 h-4" /> Cargando...
        </div>
    );

    const currencyOptions = [
        { value: 'USD', label: 'Dólares (USD $)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'EUR', label: 'Euros (EUR €)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'VES', label: 'Bolívares (VES Bs)', icon: <DollarSign className="w-4 h-4" /> },
    ];

    const periodOptions = [
        { value: 'weekly', label: 'Semanal', icon: <Calendar className="w-4 h-4" /> },
        { value: 'monthly', label: 'Mensual', icon: <Calendar className="w-4 h-4" /> },
        { value: 'yearly', label: 'Anual', icon: <Calendar className="w-4 h-4" /> },
    ];

    const accountOptions = [
        { value: '', label: 'Ninguna', icon: <PiggyBank className="w-4 h-4 text-rose-500" /> },
        ...(accounts || []).map((acc: { id: string; name: string; balance: number }) => ({
            value: acc.id,
            label: `${acc.name} - ${currencySymbol}${acc.balance.toLocaleString()}`,
            icon: <PiggyBank className="w-4 h-4" />,
        })),
    ];

    return (
        <>
            <div className="space-y-8">

                {/* Preferencias generales */}
                <form onSubmit={onSubmit} className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-[var(--foreground)] flex gap-2 items-center">
                        <Settings className="w-5 h-5 text-indigo-500" /> Preferencias Generales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Moneda Global</label>
                            <CustomSelect
                                options={currencyOptions}
                                value={formData.base_currency || 'USD'}
                                onChange={val => setFormData({ ...formData, base_currency: val })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Período Fiscal</label>
                            <CustomSelect
                                options={periodOptions}
                                value={formData.budget_period || 'monthly'}
                                onChange={val => setFormData({ ...formData, budget_period: val as any })}
                            />
                        </div>
                    </div>

                    {/* Auto-Ahorro */}
                    <div className="bg-[var(--background)] border border-[var(--card-border)] p-5 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-[var(--foreground)]">Automatización: Auto-Ahorro</h3>
                            <div className="relative inline-block w-12 h-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="auto_save"
                                    className="sr-only peer"
                                    checked={formData.auto_save_enabled || false}
                                    onChange={e => setFormData({ ...formData, auto_save_enabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                            </div>
                        </div>

                        <div className={`transition-all duration-300 space-y-4 ${formData.auto_save_enabled ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-[150px] pointer-events-none'}`}>
                            <div>
                                <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Proporción a desviar (%)</label>
                                <input
                                    type="number" max="100" min="0" placeholder="0"
                                    value={formData.saving_percentage === 0 ? '' : formData.saving_percentage}
                                    onChange={e => setFormData({
                                        ...formData,
                                        saving_percentage: e.target.value === '' ? 0 : Number(e.target.value),
                                    })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">
                                    Cuenta de Ahorro Principal
                                    {loadingAccounts && <Loader2 className="inline ml-2 w-3 h-3 animate-spin" />}
                                </label>
                                <CustomSelect
                                    options={accountOptions}
                                    value={formData.savings_account_id || ''}
                                    onChange={val => setFormData({ ...formData, savings_account_id: val })}
                                    placeholder="Seleccione la cuenta receptora..."
                                />
                                <p className="text-[10px] text-[var(--muted)] mt-1 ml-1">
                                    Todo el capital deducido irá a esta cuenta.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guardar */}
                    <div className="flex flex-col gap-3">
                        {saveSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                <Save className="w-3.5 h-3.5" /> ¡Configuraciones guardadas correctamente!
                            </div>
                        )}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={onSubmit}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all active:scale-[0.98]"
                        >
                            {loading
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <><Save className="w-4 h-4" /> Guardar Cambios</>
                            }
                        </button>
                    </div>
                </form>

                {/* Zona de riesgo */}
                <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-rose-500">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Zona de Riesgo</h2>
                    </div>

                    {/* Cerrar sesión */}
                    <div className="bg-[var(--background)] border border-[var(--card-border)] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">Cerrar Sesión</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                                Salir de tu cuenta en este dispositivo.
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 bg-[var(--card)] hover:bg-rose-500 border border-[var(--card-border)] hover:border-rose-500 text-[var(--muted)] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </div>

                    {/* Eliminar cuenta — abre el modal */}
                    <div className="bg-[var(--background)] border border-rose-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">Eliminar Cuenta</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5 max-w-sm">
                                Elimina permanentemente tu cuenta y todos tus datos. No se puede deshacer.
                            </p>
                        </div>
                        <button
                            onClick={() => setDeleteModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 text-rose-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" /> Eliminar Cuenta
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            />
        </>
    );
};