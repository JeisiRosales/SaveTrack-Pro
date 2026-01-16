import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

/**
 * PÁGINA DE REESTABLECIMIENTO DE CONTRASEÑA
 * Se llega aquí a través de un enlace enviado al correo.
 */
const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Al cargar, verificamos si hay un token en la URL (hash)
        // Supabase envía el token tras el '#' : #access_token=xxx&type=recovery
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');

            if (accessToken) {
                // Guardamos el token temporalmente para que las peticiones a 'api' lo incluyan
                localStorage.setItem('token', accessToken);
            }
        } else {
            setError('No se encontró un token de recuperación válido. Solicita uno nuevo.');
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/reset-password', { password });
            setSuccess(true);
            // Limpiamos el token temporal
            localStorage.removeItem('token');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-[440px] bg-[var(--card)] rounded-2xl shadow-xl p-8 sm:p-12 border border-[var(--card-border)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Nueva contraseña</h1>
                    <p className="text-[var(--muted)] mt-2">Ingresa tu nueva clave de acceso</p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <div className="bg-emerald-500/10 text-emerald-500 p-6 rounded-2xl mb-6 border border-emerald-500/20">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold text-lg text-emerald-500">Contraseña actualizada</p>
                            <p className="text-sm mt-2 opacity-90">Redirigiendo al inicio de sesión...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
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

                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (!!error && !window.location.hash)}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Actualizar contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
