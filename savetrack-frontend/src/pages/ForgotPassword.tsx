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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 border border-gray-100">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al inicio de sesión
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Recuperar contraseña</h1>
                    <p className="text-gray-500 mt-2">Te enviaremos un enlace para que puedas reestablecerla</p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <div className="bg-green-50 text-green-600 p-6 rounded-2xl mb-6">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold text-lg">¡Correo enviado!</p>
                            <p className="text-sm mt-2 opacity-90">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold hover:bg-[#3D46A9] transition-all shadow-lg shadow-indigo-100"
                        >
                            Ir al Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold hover:bg-[#3D46A9] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
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
