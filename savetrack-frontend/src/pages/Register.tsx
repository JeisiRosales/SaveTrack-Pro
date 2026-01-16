import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

/**
 * PÁGINA DE REGISTRO
 * Permite a los nuevos usuarios crear una cuenta en SaveTrack Pro.
 * Envía nombre, email y contraseña al backend.
 */
const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // El backend espera: { name, email, password }
            await api.post('/auth/signup', { name, email, password });

            setSuccess(true);
            // Esperamos 2 segundos para que el usuario vea el mensaje y redirigimos
            setTimeout(() => navigate('/login'), 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta con otro correo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative overflow-hidden transition-colors duration-300">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[440px] bg-[var(--card)] rounded-2xl shadow-xl p-6 sm:p-10 md:p-12 border border-[var(--card-border)] mt-12 mb-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--foreground)]">Crea tu cuenta</h1>
                        <p className="text-[var(--muted)] mt-2">Únete a SaveTrack Pro y empieza a ahorrar</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm mb-6 border border-emerald-500/20">
                            ¡Cuenta creada con éxito! Confirma tu correo para iniciar sesión.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrarme'}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-[var(--muted)]">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Register;