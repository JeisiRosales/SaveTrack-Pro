import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (savedUser && token) {
                const parsedUser = JSON.parse(savedUser);
                // Aseguramos que full_name esté disponible incluso si viene de metadata
                if (!parsedUser.full_name && parsedUser.user_metadata?.full_name) {
                    parsedUser.full_name = parsedUser.user_metadata.full_name;
                }
                setUser(parsedUser);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (userData: any, token: string) => {
        // Enriquecemos el objeto usuario con el nombre de los metadatos si es necesario
        const enrichedUser = {
            ...userData,
            full_name: userData.full_name || userData.user_metadata?.full_name || userData.email?.split('@')[0]
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        setUser(enrichedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);