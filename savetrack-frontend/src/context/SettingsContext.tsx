import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, updateUserSettings } from '@/features/user-settings/api/user-settings.api';
import { UserSettings } from '@/features/user-settings/types';
import { useAuth } from './AuthContext';

interface SettingsContextType {
    settings: UserSettings | null;
    currencySymbol: string;
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
            // Limpiar campos que NO deben enviarse al backend/supabase en un update
            const { id, user_id, created_at, updated_at, ...cleanData } = data as any;

            // Si savings_account_id es string vacio, enviamos null
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

    // Calcular el símbolo en base a la configuración
    const getSymbol = (currency?: string) => {
        switch (currency) {
            case 'EUR': return '€';
            case 'COP': return 'COP $';
            case 'VES': return 'Bs';
            case 'USD': default: return '$';
        }
    };

    const currencySymbol = getSymbol(settings?.base_currency);

    return (
        <SettingsContext.Provider value={{ settings, currencySymbol, loading, refreshSettings, saveSettings }}>
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
