import { useGlobalSettings } from '@/context/SettingsContext';

/**
 * Hook centralizado que provee la abstracción directa hacia las preferencias 
 * del usuario para su lectura (`settings`) o manipulación (`saveSettings`).
 * Ahora consume directamente del Contexto Global para asegurar sincronización en tiempo real.
 */
export const useSettings = () => {
    const { settings, loading, saveSettings } = useGlobalSettings();

    return { settings, loading, saveSettings };
};
