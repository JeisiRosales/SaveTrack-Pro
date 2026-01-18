import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Mail, Lock, Loader2, Github } from 'lucide-react';

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
            login(user, session);

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
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative overflow-hidden transition-colors duration-300">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[420px] bg-[var(--card)] rounded-2xl shadow-xl p-6 sm:p-10 border border-[var(--card-border)]">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[var(--foreground)]">Bienvenido</h1>
                        <p className="text-[var(--muted)] text-sm mt-2">Ingresa tus credenciales para continuar</p>
                    </div>

                    {success && (
                        <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm mb-6 flex items-center border border-emerald-500/20">
                            ¡Inicio de sesión exitoso!
                        </div>
                    )}

                    {isConfirmed && (
                        <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm mb-6 flex items-center border border-emerald-500/20">
                            ¡Correo verificado con éxito! Ya puedes iniciar sesión.
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 flex items-center border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" university-colors className="text-sm text-[var(--muted)] hover:text-[var(--color-primary)] font-medium transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <p className="text-center mt-5 mb-4 text-[var(--muted)]">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>

                    <div className="pt-4 border-t border-[var(--card-border)] flex justify-center">
                        <a
                            href="https://github.com/JeisiRosales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] text-[10px] text-[var(--muted)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-soft)] transition-all duration-300 group shadow-sm border border-[var(--card-border)]"
                        >
                            <Github className="w-3 h-3 transition-transform group-hover:scale-110" />
                            <span className="font-bold uppercase tracking-wider">
                                Entra a mi GitHub
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
