import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { deleteUserAccount } from '../api/user-settings.api';
import { useAuth } from '@/context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'warning' | 'confirm';

export const DeleteAccountModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [step, setStep] = useState<Step>('warning');
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const CONFIRM_PHRASE = 'ELIMINAR MI CUENTA';
    const isMatch = confirmText === CONFIRM_PHRASE;

    const handleClose = () => {
        setStep('warning');
        setConfirmText('');
        setError('');
        onClose();
    };

    const handleDelete = async () => {
        if (!user?.id || !isMatch) return;
        setIsDeleting(true);
        setError('');
        try {
            await deleteUserAccount(user.id);
            await logout();
        } catch (err) {
            console.error(err);
            setError('Hubo un error al eliminar la cuenta. Intenta de nuevo o contacta soporte.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl shadow-rose-900/20 overflow-hidden">
                <div className="p-7">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-[var(--foreground)]">
                                    Eliminar Cuenta
                                </h2>
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                                    Acción irreversible
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-[var(--muted)]" />
                        </button>
                    </div>

                    {/* Paso 1: Advertencia */}
                    {step === 'warning' && (
                        <div className="space-y-5">
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 space-y-3">
                                <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                    Esto eliminará permanentemente:
                                </p>
                                {[
                                    'Tu perfil y datos de usuario',
                                    'Todas tus cuentas y balances',
                                    'Historial de ingresos y gastos',
                                    'Metas de ahorro y su progreso',
                                    'Categorías y configuraciones',
                                ].map(item => (
                                    <div key={item} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-[var(--muted)] text-center">
                                ¿Estás completamente seguro? Esta operación <span className="font-black text-rose-400">no se puede deshacer</span>.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleClose}
                                    className="py-3 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setStep('confirm')}
                                    className="py-3 rounded-xl bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white text-sm font-black transition-all"
                                >
                                    Continuar →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirmación por texto */}
                    {step === 'confirm' && (
                        <div className="space-y-5">
                            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-4">
                                <p className="text-xs text-[var(--muted)] mb-3">
                                    Para confirmar, escribe exactamente:
                                </p>
                                <p className="text-sm font-black text-rose-400 tracking-wider font-mono mb-3 select-all">
                                    {CONFIRM_PHRASE}
                                </p>
                                <input
                                    autoFocus
                                    type="text"
                                    value={confirmText}
                                    onChange={e => { setConfirmText(e.target.value); setError(''); }}
                                    placeholder="Escribe aquí..."
                                    className={`w-full text-sm bg-[var(--input-bg)] border rounded-xl px-4 py-3 outline-none transition-all font-mono text-[var(--foreground)] placeholder:font-sans placeholder:text-[var(--muted)] ${confirmText.length > 0
                                        ? isMatch
                                            ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                            : 'border-rose-500/50 focus:ring-1 focus:ring-rose-500'
                                        : 'border-[var(--input-border)] focus:border-rose-500'
                                        }`}
                                />
                                {confirmText.length > 0 && !isMatch && (
                                    <p className="text-[10px] text-rose-400 font-bold mt-1.5 ml-1">
                                        El texto no coincide exactamente.
                                    </p>
                                )}
                                {isMatch && (
                                    <p className="text-[10px] text-emerald-400 font-bold mt-1.5 ml-1">
                                        ✓ Confirmado. Puedes proceder.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setStep('warning')}
                                    className="py-3 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all"
                                >
                                    ← Volver
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!isMatch || isDeleting}
                                    className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {isDeleting
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <><Trash2 className="w-4 h-4" /> Eliminar</>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};