import React from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { FixedExpense } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string) => Promise<void>;
    expense: FixedExpense | null;
}

export const DeleteFixedExpenseModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, expense }) => {
    const [loading, setLoading] = React.useState(false);

    if (!isOpen || !expense) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(expense.id);
            onClose();
        } catch (err) {
            console.error('Error deleting fixed expense:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={() => !loading && onClose()} 
            />

            <div className="relative bg-[var(--card)] w-full max-w-sm rounded-[2rem] p-8 border border-[var(--card-border)] shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <Trash2 className="w-8 h-8 text-rose-500" />
                    </div>

                    <h2 className="text-xl font-black text-[var(--foreground)] mb-2">¿Eliminar Compromiso?</h2>
                    <p className="text-sm text-[var(--muted)] font-medium mb-8 leading-relaxed px-2">
                        Se eliminará el compromiso <span className="text-[var(--foreground)] font-black italic">"{expense.name}"</span>. 
                        Las transacciones ya registradas no se verán afectadas.
                    </p>

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sí, Eliminar'}
                        </button>
                        
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-4 bg-[var(--background)] hover:bg-[var(--input-bg)] text-[var(--foreground)] font-black rounded-2xl border border-[var(--card-border)] transition-all active:scale-[0.98]"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
