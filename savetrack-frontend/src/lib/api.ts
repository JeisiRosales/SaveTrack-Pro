import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// inicializamos supabase
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

api.interceptors.request.use(async (config) => {
    // Obtenemos la sesión de Supabase
    const { data: { session } } = await supabase.auth.getSession();

    let token = session?.access_token;

    // si no hay sesión, obtenemos el token de localStorage
    if (!token) {
        token = localStorage.getItem('token') || '';
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;