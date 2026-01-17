import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Inicializamos Supabase para poder usar el refresco automático
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

api.interceptors.request.use(async (config) => {
    // 1. Intentamos obtener la sesión real de Supabase (Gestiona el refresco automático)
    const { data: { session } } = await supabase.auth.getSession();

    let token = session?.access_token;

    // 2. Si Supabase no tiene sesión (porque el login fue manual), usamos tu localStorage
    if (!token) {
        token = localStorage.getItem('token') || '';
    } else {
        localStorage.setItem('token', token);
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;