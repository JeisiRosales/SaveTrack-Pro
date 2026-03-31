import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { UserSettings } from '../types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useGlobalSettings } from '@/context/SettingsContext';
import {
    Settings, Loader2,
    DollarSign, Calendar, PiggyBank,
    EuroIcon,
    CoinsIcon,
    Sun, Moon
} from 'lucide-react';

export const SettingsForm = () => {
    const { settings, saveSettings, loading } = useSettings();
    const { accounts, loading: loadingAccounts } = useAccounts();
    const { currencySymbol } = useGlobalSettings();
    const [formData, setFormData] = useState<Partial<UserSettings>>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

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
        { value: 'EUR', label: 'Euros (EUR €)', icon: <EuroIcon className="w-4 h-4" /> },
        { value: 'VES', label: 'Bolívares (VES Bs)', icon: <CoinsIcon className="w-4 h-4" /> },
        { value: 'MXN', label: 'Peso Mexicano (MXN $)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'COP', label: 'Peso Colombiano (COP $)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'CLP', label: 'Peso Chileno (CLP $)', icon: <DollarSign className="w-4 h-4" /> },
    ];

    const periodOptions = [
        { value: 'daily', label: 'Diario', icon: <Calendar className="w-4 h-4" /> },
        { value: 'weekly', label: 'Semanal', icon: <Calendar className="w-4 h-4" /> },
        { value: 'biweekly', label: 'Quincenal', icon: <Calendar className="w-4 h-4" /> },
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
        <div className="space-y-8">

            {/* Apariencia Visual */}
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm">
                <h2 className="text-lg font-bold text-[var(--foreground)] flex gap-2 items-center mb-4">
                    <Settings className="w-5 h-5 text-indigo-500" /> Apariencia
                </h2>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] cursor-pointer hover:border-indigo-500/30 transition-colors" onClick={toggleTheme}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[var(--foreground)]">Tema de la App</p>
                            <p className="text-[10px] text-[var(--muted)]">{darkMode ? 'Modo Oscuro' : 'Modo Claro'}</p>
                        </div>
                    </div>
                    <div className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-indigo-500' : ''}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-4' : ''}`}></div>
                    </div>
                </div>
            </div>

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
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="auto_save"
                                className="sr-only peer"
                                checked={formData.auto_save_enabled || false}
                                onChange={e => setFormData({ ...formData, auto_save_enabled: e.target.checked })}
                            />
                            <label
                                htmlFor="auto_save"
                                className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
                            />
                        </div>
                    </div>

                    <div className={`transition-all duration-300 space-y-4 ${formData.auto_save_enabled ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'}`}>
                        <div>
                            <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">
                                Proporción a desviar (%)
                            </label>
                            <input
                                type="number" max="100" min="0" placeholder="0"
                                value={formData.saving_percentage === 0 ? '' : formData.saving_percentage}
                                onChange={e => setFormData({
                                    ...formData,
                                    saving_percentage: e.target.value === '' ? 0 : Number(e.target.value),
                                })}
                                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                            ¡Configuraciones guardadas correctamente!
                        </div>
                    )}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onSubmit}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> Guardar Cambios</>}
                    </button>
                </div>
            </form>
        </div>
    );
};