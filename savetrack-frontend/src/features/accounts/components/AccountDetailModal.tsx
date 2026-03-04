import React from 'react';
import { X, Loader2, Clock, Wallet, Pencil, Trash2, Plus } from 'lucide-react';
import { Account, EditAccountForm, Transaction } from '../types';

interface AccountDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account | null;
    isEditMode: boolean;
    onEditModeChange: (isEdit: boolean) => void;
    editForm: EditAccountForm;
    onEditFormChange: (form: EditAccountForm) => void;
    isUpdating: boolean;
    onUpdate: () => void;
    isDeleting: boolean;
    onDelete: () => void;
    showDeleteConfirm: boolean;
    onDeleteConfirmChange: (show: boolean) => void;
    transactions: Transaction[];
    loadingTransactions: boolean;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
    isOpen,
    onClose,
    account,
    isEditMode,
    onEditModeChange,
    editForm,
    onEditFormChange,
    isUpdating,
    onUpdate,
    isDeleting,
    onDelete,
    showDeleteConfirm,
    onDeleteConfirmChange,
    transactions,
    loadingTransactions
}) => {
    if (!isOpen || !account) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !isUpdating && !isDeleting && onClose()}
            />

            <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--card-border)] animate-in fade-in zoom-in duration-300">
                <div className="max-h-[85vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[var(--foreground)]">
                            {isEditMode ? 'Editar Cuenta' : 'Información de Cuenta'}
                        </h3>
                        {!isUpdating && !isDeleting && (
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-[var(--background)] rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--muted)]" />
                            </button>
                        )}
                    </div>

                    {isEditMode ? (
                        <form onSubmit={(e) => { e.preventDefault(); onUpdate(); }} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-2 px-1">Nombre de la Cuenta</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-[var(--foreground)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase mb-2 px-1">Saldo Actual ($)</label>
                                <input
                                    type="number"
                                    value={editForm.balance}
                                    onChange={(e) => onEditFormChange({ ...editForm, balance: Number(e.target.value) })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-[var(--foreground)]"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => onEditModeChange(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--card-border)] transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center text-sm"
                                >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[var(--accent-soft)] p-5 rounded-2xl border border-[var(--card-border)]">
                                <p className="text-[10px] font-bold text-[var(--accent-text)] opacity-80 uppercase mb-1">Saldo Disponible</p>
                                <p className="text-3xl font-bold text-[var(--accent-text)]">
                                    ${account.balance.toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted)] flex items-center gap-2"><Clock className="w-4 h-4" /> Creado el</span>
                                    <span className="font-bold text-[var(--foreground)]">{new Date(account.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted)] flex items-center gap-2"><Wallet className="w-4 h-4" /> Nombre</span>
                                    <span className="font-bold text-[var(--foreground)]">{account.name}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[var(--card-border)]">
                                <h4 className="text-sm font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[var(--accent-text)] opacity-60" />
                                    Historial Reciente
                                </h4>
                                {loadingTransactions ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-text)]" />
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="space-y-3">
                                        {transactions.slice(0, 5).map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center bg-[var(--background)] p-3 rounded-xl border border-[var(--card-border)]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        <Plus className={`w-4 h-4 ${tx.type !== 'deposit' && 'rotate-45'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[var(--foreground)] capitalize">{tx.type === 'deposit' ? 'Depósito' : 'Retiro'}</p>
                                                        <p className="text-[10px] text-[var(--muted)]">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-black ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {tx.type === 'deposit' ? '-' : '+'}${tx.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[var(--muted)] text-center py-4 italic">No hay movimientos registrados.</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 pt-6 border-t border-[var(--card-border)]">
                                {showDeleteConfirm ? (
                                    <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-in slide-in-from-bottom-2 duration-300">
                                        <p className="text-xs font-bold text-rose-500 mb-3 text-center">¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => onDeleteConfirmChange(false)}
                                                className="flex-1 py-3 bg-[var(--card)] text-[var(--muted)] rounded-xl text-sm font-bold border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                                            >
                                                No, cancelar
                                            </button>
                                            <button
                                                onClick={onDelete}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors shadow-sm flex items-center justify-center"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onEditModeChange(true)}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent-soft)] text-[var(--accent-text)] rounded-2xl font-bold hover:opacity-80 transition-opacity"
                                        >
                                            <Pencil className="w-4 h-4" /> Editar Cuenta
                                        </button>
                                        <button
                                            onClick={() => onDeleteConfirmChange(true)}
                                            className="w-full flex items-center justify-center gap-2 py-4 text-rose-500 rounded-2xl font-bold hover:bg-rose-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Eliminar Cuenta
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
