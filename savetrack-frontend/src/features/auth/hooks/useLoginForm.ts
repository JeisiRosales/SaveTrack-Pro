import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { loginRequest } from '../api/auth.api';

// Hook para manejar el inicio de sesión
export const useLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Manejamos el inicio de sesión
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await loginRequest({ email, password });
            const { user, session } = response.data.data;
            login(user, session);
            navigate('/Dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return { email, setEmail, password, setPassword, loading, error, handleLogin };
};