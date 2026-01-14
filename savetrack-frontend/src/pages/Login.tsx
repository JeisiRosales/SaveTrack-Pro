import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

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
                navigate('/dashboard');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#0051FF10] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-8 h-8 text-[#0051FF]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
                    <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
                </div>

                {success && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 flex items-center">
                        ¡Inicio de sesión exitoso! (Conexión backend OK)
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
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0051FF] focus:border-transparent outline-none transition-all"
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
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0051FF] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0051FF] text-white py-4 rounded-xl font-bold hover:bg-[#0041CC] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-[#0051FF] font-bold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
