import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { UserSettings } from '../types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useGlobalSettings } from '@/context/SettingsContext';
import { Trash2, Settings, Save, Loader2, DollarSign, Calendar, PiggyBank, AlertTriangle, LogOut } from 'lucide-react';
import { deleteUserAccount } from '../api/user-settings.api';
import { useAuth } from '@/context/AuthContext';

export const SettingsForm = () => {
    const { settings, saveSettings, loading } = useSettings();
    const { accounts, loading: loadingAccounts } = useAccounts();
    const { currencySymbol } = useGlobalSettings();
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState<Partial<UserSettings>>({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const onSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();
        setSaveSuccess(false);
        try {
            await saveSettings(formData);
            setSaveSuccess(true);
            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert('Error al guardar las configuraciones.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) return;

        const confirmFirst = window.confirm('¿Estás COMPLETAMENTE seguro? Esta acción eliminará permanentemente tu cuenta, transacciones, metas y categorías. No se puede deshacer.');
        if (!confirmFirst) return;

        const confirmSecond = window.prompt('Para confirmar, escribe "ELIMINAR MI CUENTA" en el recuadro:');
        if (confirmSecond !== 'ELIMINAR MI CUENTA') {
            alert('Confirmación incorrecta. La cuenta NO ha sido eliminada.');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUserAccount(user.id);
            alert('Tu cuenta ha sido eliminada exitosamente. Esperamos verte pronto.');
            await logout();
        } catch (error) {
            console.error('Error al eliminar cuenta:', error);
            alert('Hubo un error al intentar eliminar la cuenta. Por favor, intenta de nuevo o contacta a soporte.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading && !settings) return <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Cargando...</div>;

    const currencyOptions = [
        { value: 'USD', label: 'Dólares (USD $)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'EUR', label: 'Euros (EUR €)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 'VES', label: 'Bolívares (VES Bs)', icon: <DollarSign className="w-4 h-4" /> }
    ];

    const periodOptions = [
        { value: 'weekly', label: 'Semanal', icon: <Calendar className="w-4 h-4" /> },
        { value: 'monthly', label: 'Mensual', icon: <Calendar className="w-4 h-4" /> },
        { value: 'yearly', label: 'Anual', icon: <Calendar className="w-4 h-4" /> }
    ];

    const accountOptions = (accounts || []).map((acc: { id: string; name: string; balance: number }) => ({
        value: acc.id,
        label: `${acc.name} - ${currencySymbol}${acc.balance.toLocaleString()}`,
        icon: <PiggyBank className="w-4 h-4" />
    }));

    // Opción por defecto genérica
    accountOptions.unshift({ value: '', label: 'Ninguna', icon: <PiggyBank className="w-4 h-4 text-rose-500" /> });

    return (
        <div className="space-y-8">
            <form onSubmit={onSubmit} className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-[var(--foreground)] flex gap-2 items-center mb-6">
                    <Settings className="w-5 h-5 text-indigo-500" /> Preferencias Generales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Moneda Global</label>
                        <CustomSelect
                            options={currencyOptions}
                            value={formData.base_currency || 'USD'}
                            onChange={(val) => setFormData({ ...formData, base_currency: val })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Período Fiscal</label>
                        <CustomSelect
                            options={periodOptions}
                            value={formData.budget_period || 'monthly'}
                            onChange={(val) => setFormData({ ...formData, budget_period: val as any })}
                        />
                    </div>
                </div>

                <div className="bg-[var(--background)] border border-[var(--card-border)] p-5 rounded-2xl relative transition-all">
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
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                    </div>

                    <div className={`transition-all duration-300 space-y-4 ${formData.auto_save_enabled ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-[150px] pointer-events-none'}`}>
                        <div>
                            <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Proporción a desvíar (%)</label>
                            <input
                                type="number"
                                max="100"
                                min="0"
                                placeholder="0"
                                // Si el valor es 0, lo pasamos como string vacío para que se vea el placeholder
                                value={formData.saving_percentage === 0 ? '' : formData.saving_percentage}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Si el input está vacío, guardamos 0 (o null), de lo contrario el número
                                    setFormData({
                                        ...formData,
                                        saving_percentage: val === '' ? 0 : Number(val)
                                    });
                                }}
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
                                onChange={(val) => setFormData({ ...formData, savings_account_id: val })}
                                placeholder="Seleccione la cuenta receptora..."
                            />
                            <p className="text-[10px] text-[var(--muted)] mt-1 ml-1">Todo el capital deducido irá a esta cuenta.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {saveSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <Save className="w-3.5 h-3.5" /> ¡Configuraciones guardadas correctamente!
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onSubmit}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all active:scale-[0.98]">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                    </button>
                </div>
            </form>

            <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Zona de Riesgo</h2>
                </div>

                {/* Zona Peligrosa */}
                <div className="bg-rose-500/5 p-5 rounded-3xl border border-rose-500/20 shadow-sm mt-auto">
                    <button
                        onClick={logout}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">Eliminar Cuenta</p>
                        <p className="text-xs text-[var(--muted)] mt-1 max-w-md">Esta acción es irreversible. Se borrarán todos tus datos, metas, ingresos y gastos de forma permanente.</p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Eliminar Permanentemente</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
