import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings } from '@/features/user-settings/api/user-settings.api';
import { UserSettings } from '@/features/user-settings/types';
import { useAuth } from './AuthContext';

interface SettingsContextType {
    settings: UserSettings | null;
    currencySymbol: string;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);

    const refreshSettings = async () => {
        if (!user) return;
        try {
            const res = await getUserSettings();
            setSettings(res.data);

            // Si el backend dictara el tema global (opcional)
            // if (res.data.theme === 'dark') { ... } 
        } catch (error) {
            console.error('[SettingsContext] Error al cargar configuraciones:', error);
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
            case 'USD': default: return '$';
        }
    };

    const currencySymbol = getSymbol(settings?.base_currency);

    return (
        <SettingsContext.Provider value={{ settings, currencySymbol, refreshSettings }}>
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
