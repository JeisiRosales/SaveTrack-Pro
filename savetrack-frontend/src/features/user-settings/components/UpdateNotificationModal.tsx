import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

const CURRENT_VERSION = '1.1.0';

export const UpdateNotificationModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('last_seen_version');
        if (lastSeenVersion !== CURRENT_VERSION) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('last_seen_version', CURRENT_VERSION);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={handleClose} 
            />

            <div className="relative bg-[var(--card)] w-full max-w-lg rounded-[2.5rem] p-8 border border-[var(--card-border)] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

                <div className="flex flex-col relative z-10">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                    </div>

                    <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">¡Nueva Versión Disponible!</h2>
                    <p className="text-sm font-bold text-indigo-500 mb-6 uppercase tracking-widest">
                        SaveTrack Pro v{CURRENT_VERSION}
                    </p>
                    <p className="text-sm text-[var(--muted)] font-medium mb-6 leading-relaxed">
                        Hemos rediseñado la experiencia de los Gastos Fijos para darte un control financiero absoluto.
                    </p>

                    <div className="bg-[var(--background)] rounded-3xl p-6 border border-[var(--card-border)] mb-8 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--foreground)]">Pagos Parciales Reales</h4>
                                <p className="text-xs text-[var(--muted)] mt-1">Sigue el rastro de abonos incompletos con nuevas métricas visuales al centavo.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--foreground)]">Protección Inteligente</h4>
                                <p className="text-xs text-[var(--muted)] mt-1">El sistema detectará si pagas de más y te preguntará si deseas ajustar el presupuesto mensual.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--foreground)]">Eliminación Premium</h4>
                                <p className="text-xs text-[var(--muted)] mt-1">Una nueva experiencia estizada y segura al eliminar compromisos fijos.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                    >
                        ¡Entendido, continuemos!
                    </button>
                </div>

                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-full transition-colors font-bold z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
