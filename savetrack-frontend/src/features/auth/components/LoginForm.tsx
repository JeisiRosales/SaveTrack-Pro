import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginRequest } from '../api/auth.api';

// Interfaz para las propiedades del formulario de inicio de sesión
export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isConfirmed = searchParams.get('confirmed') === 'true';

    // manejamos el envio del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await loginRequest({ email, password });
            const { user, session } = response.data.data;

            login(user, session);
            setSuccess(true);

            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(msg === 'Email not confirmed'
                ? 'Debes confirmar tu correo antes de iniciar sesión.'
                : msg || 'Error al iniciar sesión.');

            setError(
                msg === 'Invalid login credentials'
                    ? 'Credenciales inválidas'
                    : msg || 'Credenciales inválidas.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[420px] bg-[var(--card)] rounded-2xl shadow-xl p-6 sm:p-10 border border-[var(--card-border)]">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Bienvenido</h1>
                <p className="text-[var(--muted)] text-sm mt-2">Ingresa tus credenciales para continuar</p>
            </div>

            {(success || isConfirmed) && (
                <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm mb-6 border border-emerald-500/20">
                    {success ? '¡Inicio de sesión exitoso!' : '¡Correo verificado! Ya puedes entrar.'}
                </div>
            )}

            {error && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
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
                            placeholder="Correo Electrónico"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-[var(--muted)] text-sm font-bold">¿Olvidaste tu contraseña?</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[var(--card-border)] text-center">
                <Link to="/register" className="text-indigo-500 text-sm font-bold">¿No tienes cuenta? Regístrate</Link>
            </div>
        </div>
    );
};