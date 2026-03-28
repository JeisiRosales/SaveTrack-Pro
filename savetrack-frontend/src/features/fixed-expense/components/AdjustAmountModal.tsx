import React from 'react';
import { X, TrendingUp, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdjustAndSave: () => Promise<void>;
    currentAmount: number;
    newAmount: number;
    categoryName: string;
    currencySymbol: string;
}

export const AdjustAmountModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onAdjustAndSave, 
    currentAmount, 
    newAmount, 
    categoryName,
    currencySymbol 
}) => {
    const [loading, setLoading] = React.useState(false);

    if (!isOpen) return null;

    const fmt = (n: number) => `${currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onAdjustAndSave();
            onClose();
        } catch (err) {
            console.error('Error adjusting commitment amount:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={() => !loading && onClose()} 
            />

            <div className="relative bg-[var(--card)] w-full max-w-md rounded-[2.5rem] p-8 border border-[var(--card-border)] shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-7 h-7 text-amber-500" />
                    </div>

                    <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">Ajuste de Monto Detectado</h2>
                    <p className="text-sm text-[var(--muted)] font-medium mb-8 leading-relaxed">
                        Estás pagando más de lo proyectado para <span className="text-[var(--foreground)] font-bold">"{categoryName}"</span>. 
                        ¿Deseas actualizar el monto mensual de este compromiso?
                    </p>

                    <div className="bg-[var(--background)] rounded-3xl p-6 border border-[var(--card-border)] mb-8 space-y-4">
                        <div className="flex items-center justify-between opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Proyección Actual</span>
                            <span className="text-sm font-bold text-[var(--foreground)]">{fmt(currentAmount)}</span>
                        </div>
                        
                        <div className="flex items-center justify-center py-1">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
                            <ArrowRight className="w-4 h-4 text-amber-500 mx-4" />
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Nueva Proyección</span>
                            <span className="text-xl font-black text-amber-500">{fmt(newAmount)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Actualizar y Guardar Pago
                                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-5 bg-transparent hover:bg-[var(--input-bg)] text-[var(--muted)] font-bold rounded-2xl transition-all active:scale-[0.98]"
                        >
                            No, corregir monto ingresado
                        </button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-full transition-colors font-bold"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
