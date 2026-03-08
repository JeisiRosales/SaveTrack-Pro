import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { getUserSettings, updateUserSettings } from '../api/user-settings.api';

/**
 * Hook centralizado que provee la abstracción directa hacia las preferencias 
 * del usuario para su lectura (`settings`) o manipulación (`saveSettings`).
 */
export const useSettings = () => {
    // Almacena cache temporal tras el `fetch` primario
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Trae y rehidrata el cache interno capturando problemas de red con un try/catch preventivo.
     */
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUserSettings();
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Despacho primario post-montaje
    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    /**
     * Sincroniza modificaciones parciales de UI hacia la BD.
     * @param data Propiedades (settings) modificadas provenientes del Formulario.
     */
    const saveSettings = async (data: Partial<UserSettings>) => {
        setLoading(true);
        try {
            const res = await updateUserSettings(data);
            setSettings(res.data);
        } catch (error) {
            console.error('Error saving settings', error);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading, saveSettings };
};
