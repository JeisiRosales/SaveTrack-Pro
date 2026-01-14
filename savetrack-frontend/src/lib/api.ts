import axios from 'axios';

/**
 * Configuración centralizada de Axios
 * Se encarga de conectar con el backend y manejar el token de seguridad.
 */
const api = axios.create({
    // VITE_API_URL debe estar definida en el archivo .env de Vercel o Local
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

/**
 * Interceptor de Peticiones:
 * Antes de enviar cualquier petición al backend, buscamos si hay un token
 * guardado en el navegador. Si existe, lo enviamos en el Header de Authorization.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Formato JWT estándar
    }
    return config;
});

export default api;
