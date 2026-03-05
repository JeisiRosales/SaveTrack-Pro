import React from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    goalName: string;
    isDeleting: boolean;
}

const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    goalName,
    isDeleting
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => !isDeleting && onClose()}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--card-border)] animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="p-1.5 hover:bg-[var(--background)] rounded-lg text-[var(--muted)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                            ¿Eliminar meta?
                        </h3>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">
                            Estás a punto de eliminar la meta <span className="font-bold text-[var(--foreground)]">"{goalName}"</span>. Esta acción no se puede deshacer y perderás el historial de progreso asociado.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 border border-[var(--card-border)] text-[var(--muted)] font-bold rounded-xl hover:bg-[var(--background)] transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 text-sm"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteGoalModal;
