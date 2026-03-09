import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, updateUserSettings } from '@/features/user-settings/api/user-settings.api';
import { UserSettings } from '@/features/user-settings/types';
import { useAuth } from './AuthContext';
import { BudgetPeriod, PERIOD_LABELS, PERIOD_INSTALLMENT_LABELS, PERIOD_UNIT_LABELS } from '@/features/goals/utils/goal-calculations';

interface SettingsContextType {
    settings: UserSettings | null;
    currencySymbol: string;
    budgetPeriod: BudgetPeriod;
    periodLabel: string;           // ej: "semanalmente", "mensualmente"
    periodInstallmentLabel: string; // ej: "cuota semanal", "cuota mensual"
    periodUnitLabel: string;        // ej: "semana", "mes"
    loading: boolean;
    refreshSettings: () => Promise<void>;
    saveSettings: (data: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshSettings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await getUserSettings();
            setSettings(res.data);
        } catch (error) {
            console.error('[SettingsContext] Error al cargar configuraciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (data: Partial<UserSettings>) => {
        setLoading(true);
        try {
            const { id, user_id, created_at, updated_at, ...cleanData } = data as any;

            if (cleanData.savings_account_id === '') {
                cleanData.savings_account_id = null;
            }

            const res = await updateUserSettings(cleanData);
            setSettings(res.data);
        } catch (error) {
            console.error('[SettingsContext] Error al guardar configuraciones:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, [user]);

    const getSymbol = (currency?: string) => {
        switch (currency) {
            case 'EUR': return '€ ';
            case 'VES': return 'Bs ';
            case 'USD': default: return '$ ';
            case 'MXN': return '$ ';
            case 'COP': return '$ ';
            case 'CLP': return '$ ';
        }
    };

    const currencySymbol = getSymbol(settings?.base_currency);

    // Período presupuestario activo (default: monthly)
    const budgetPeriod: BudgetPeriod = (settings?.budget_period as BudgetPeriod) ?? 'monthly';
    const periodLabel = PERIOD_LABELS[budgetPeriod];
    const periodInstallmentLabel = PERIOD_INSTALLMENT_LABELS[budgetPeriod];
    const periodUnitLabel = PERIOD_UNIT_LABELS[budgetPeriod];

    return (
        <SettingsContext.Provider value={{
            settings,
            currencySymbol,
            budgetPeriod,
            periodLabel,
            periodInstallmentLabel,
            periodUnitLabel,
            loading,
            refreshSettings,
            saveSettings,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useGlobalSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useGlobalSettings must be used within a SettingsProvider');
    }
    return context;
};