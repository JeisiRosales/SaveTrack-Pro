import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

/**
 * PÁGINA DE RECUPERACIÓN DE CONTRASEÑA
 * Permite a los usuarios solicitar un enlace para reestablecer su contraseña.
 */
const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-[440px] bg-[var(--card)] rounded-2xl shadow-xl p-8 sm:p-12 border border-[var(--card-border)]">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al inicio de sesión
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Recuperar contraseña</h1>
                    <p className="text-[var(--muted)] mt-2">Te enviaremos un enlace para que puedas reestablecerla</p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <div className="bg-emerald-500/10 text-emerald-500 p-6 rounded-2xl mb-6 border border-emerald-500/20">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold text-lg text-emerald-500">¡Correo enviado!</p>
                            <p className="text-sm mt-2 opacity-90">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"
                        >
                            Ir al Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar enlace'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
