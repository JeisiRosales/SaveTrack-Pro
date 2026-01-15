import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Mail, Lock, Loader2 } from 'lucide-react';

/**
 * PÁGINA DE LOGIN
 * Permite a los usuarios existentes acceder a su cuenta.
 * Incluye validaciones básicas y manejo de estados de carga.
 */
const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get('confirmed') === 'true') {
            setIsConfirmed(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Petición al backend al endpoint de login
            const response = await api.post('/auth/login', { email, password });

            // Extraemos el token y la info del usuario
            const { user, session } = response.data;

            // Guardamos en el contexto global y localStorage
            login(user, session.access_token);

            setSuccess(true);
            // Intentamos ir al dashboard si existe, sino nos quedamos con el mensaje de éxito
            setTimeout(() => {
                navigate('/Dashboard');
            }, 1000);
        } catch (err: any) {
            if (err.response?.data?.message === 'Email not confirmed') {
                setError('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
            } else {
                setError(err.response?.data?.message || 'Error al iniciar sesión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-xl p-6 sm:p-10 md:p-12 border border-gray-100 mt-12 mb-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
                        <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
                    </div>

                    {success && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 flex items-center">
                            ¡Inicio de sesión exitoso!
                        </div>
                    )}

                    {isConfirmed && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 flex items-center">
                            ¡Correo verificado con éxito! Ya puedes iniciar sesión.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="text-black w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="text-black w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" university-colors className="text-sm text-gray-500 hover:text-[var(--color-primary)] font-medium transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold hover:bg-[#3D46A9] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
