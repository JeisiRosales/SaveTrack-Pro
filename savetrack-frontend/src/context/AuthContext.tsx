import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/api'

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                handleUser(session.user, session.access_token);
            }
            setLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                handleUser(session.user, session.access_token);
            } else {
                // Si el evento es SIGNED_OUT, limpiamos
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateProfile = async (updates: { full_name: string }) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            // Actualizamos los metadatos de la sesión de Supabase para mantener consistencia
            const { data: authData, error: authError } = await supabase.auth.updateUser({
                data: { full_name: updates.full_name }
            });

            if (authError) throw authError;

            // Actualizamos el estado local
            const updatedUser = { ...user, full_name: updates.full_name, user_metadata: authData.user.user_metadata };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true };
        } catch (error) {
            console.error('[AuthContext] Error al actualizar perfil:', error);
            throw error;
        }
    };

    const handleUser = (supabaseUser: any, token: string) => {
        const enrichedUser = {
            ...supabaseUser,
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0]
        };

        // Seguimos guardando en localStorage por si tu backend actual lo necesita ahí
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        setUser(enrichedUser);
    };

    const login = async (userData: any, session: any) => {
        // 1. Sincronizamos con la librería de Supabase para activar el autorefresco
        if (session?.access_token && session?.refresh_token) {
            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token
            });
        }

        // 2. Enriquecemos el usuario como ya lo hacías
        const enrichedUser = {
            ...userData,
            full_name: userData.full_name || userData.user_metadata?.full_name || userData.email?.split('@')[0]
        };

        // 3. Guardamos en LocalStorage (mantenemos las llaves viejas por compatibilidad si quieres)
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(enrichedUser));

        setUser(enrichedUser);
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('[AuthContext] Error en signOut de Supabase:', error);
        } finally {
            // Limpieza Total
            localStorage.clear(); // Limpia token, user, theme, etc.
            setUser(null);

            // Usamos replace para evitar volver atrás al dashboard
            window.location.replace('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);