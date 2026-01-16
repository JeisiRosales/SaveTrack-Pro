import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import {
    Wallet,
    Pencil,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    Clock,
    Plus,
    Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import CreateAccountModal from '../components/modals/CreateAccountModal';

/**
 * PÁGINA DE GESTIÓN DE CUENTAS
 * Permite ver, editar y eliminar las cuentas de financiamiento del usuario.
 */
const Accounts: React.FC = () => {
    useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [accounts, setAccounts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Estado para Modales y Edición
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', balance: 0 });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/funding-accounts');
            setAccounts(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching accounts:", err);
            setError("No se pudieron cargar tus cuentas. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = async (account: any) => {
        setSelectedAccount(account);
        setEditForm({ name: account.name, balance: account.balance });
        setIsDetailModalOpen(true);
        setIsEditMode(false);
        setShowDeleteConfirm(false);

        // Cargar transacciones de la cuenta
        try {
            setLoadingTransactions(true);
            const response = await api.get(`/transactions/account/${account.id}`);
            setTransactions(response.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return;

        try {
            setIsUpdating(true);
            await api.patch(`/funding-accounts/${selectedAccount.id}`, editForm);
            await fetchAccounts();
            setIsEditMode(false);
            // Actualizar el account seleccionado localmente para reflejar cambios en el modal
            setSelectedAccount({ ...selectedAccount, ...editForm });
        } catch (err) {
            console.error("Error updating account:", err);
            alert("No se pudo actualizar la cuenta.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;

        try {
            setIsDeleting(true);
            await api.delete(`/funding-accounts/${selectedAccount.id}`);
            await fetchAccounts();
            setIsDetailModalOpen(false);
            setSelectedAccount(null);
        } catch (err) {
            console.error("Error deleting account:", err);
            alert("No se pudo eliminar la cuenta.");
        } finally {
            setIsDeleting(false);
        }
    };

    const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-[var(--accent-text)]" />
                            Mis Cuentas
                        </h1>
                        <p className="text-[var(--muted)] text-xs mt-1 font-medium">Administra tus fuentes de ahorro y saldos.</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Resumen Global */}
                        <div className="bg-[var(--accent-soft)] p-6 lg:p-8 rounded-2xl border border-[var(--card-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Saldo Consolidado</h2>
                                <h3 className="text-3xl font-bold mt-2 text-[var(--accent-text)]">
                                    ${totalBalance.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-xs text-[var(--muted)] font-medium">
                                <span className="text-[var(--accent-text)] font-bold">{accounts.length}</span> cuentas activas
                            </div>
                        </div>

                        {/* Grid de Cuentas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accounts.length > 0 ? (
                                accounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => handleOpenDetails(acc)}
                                        className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-8 h-8 bg-[var(--accent-soft)] rounded-lg flex items-center justify-center text-[var(--accent-text)]">
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                                                    {totalBalance > 0 ? `${Math.round((acc.balance / totalBalance) * 100)}%` : '0%'}
                                                </span>
                                            </div>
                                            <h5 className="text-sm font-bold text-[var(--foreground)] leading-tight mb-1">{acc.name}</h5>
                                            <p className="text-xl font-bold text-[var(--accent-text)]">${acc.balance.toLocaleString()}</p>
                                            <p className="text-[10px] text-[var(--muted)] mt-1">Toca para ver detalles</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-[var(--card)] border border-dashed border-[var(--card-border)] rounded-2xl p-12 text-center text-[var(--muted)]">
                                    No tienes cuentas registradas. Crea una desde el Dashboard.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAccountCreated={fetchAccounts}
            />

            {/* Modal de Detalles / Edición */}
            {isDetailModalOpen && selectedAccount && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isUpdating && !isDeleting && setIsDetailModalOpen(false)}
                    />

                    <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--card-border)] animate-in fade-in zoom-in duration-300">
                        <div className="max-h-[85vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-[var(--foreground)]">
                                    {isEditMode ? 'Editar Cuenta' : 'Información de Cuenta'}
                                </h3>
                                {!isUpdating && !isDeleting && (
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="p-1.5 hover:bg-[var(--background)] rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-[var(--muted)]" />
                                    </button>
                                )}
                            </div>

                            {isEditMode ? (
                                <form onSubmit={handleUpdateAccount} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 px-1">Nombre de la Cuenta</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-[var(--foreground)]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 px-1">Saldo Actual ($)</label>
                                        <input
                                            type="number"
                                            value={editForm.balance}
                                            onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-[var(--foreground)]"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditMode(false)}
                                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--card-border)] transition-colors text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center text-sm"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-[var(--accent-soft)] p-5 rounded-2xl border border-[var(--card-border)]">
                                        <p className="text-[10px] font-bold text-[var(--accent-text)] opacity-80 uppercase tracking-widest mb-1">Saldo Disponible</p>
                                        <p className="text-3xl font-bold text-[var(--accent-text)]">
                                            ${selectedAccount.balance.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-4 px-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--muted)] flex items-center gap-2"><Clock className="w-4 h-4" /> Creado el</span>
                                            <span className="font-bold text-[var(--foreground)]">{new Date(selectedAccount.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--muted)] flex items-center gap-2"><Wallet className="w-4 h-4" /> Nombre</span>
                                            <span className="font-bold text-[var(--foreground)]">{selectedAccount.name}</span>
                                        </div>
                                    </div>

                                    {/* Historial de Transacciones */}
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
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                <Plus className={`w-4 h-4 ${tx.type !== 'deposit' && 'rotate-45'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[var(--foreground)] capitalize">{tx.type === 'deposit' ? 'Depósito' : 'Retiro'}</p>
                                                                <p className="text-[10px] text-[var(--muted)]">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className={`text-xs font-black ${tx.type === 'deposit' ? 'text-[var(--accent-text)]' : 'text-rose-500'}`}>
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
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="flex-1 py-3 bg-[var(--card)] text-[var(--muted)] rounded-xl text-sm font-bold border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                                                    >
                                                        No, cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteAccount}
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
                                                    onClick={() => setIsEditMode(true)}
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent-soft)] text-[var(--accent-text)] rounded-2xl font-bold hover:opacity-80 transition-opacity"
                                                >
                                                    <Pencil className="w-4 h-4" /> Editar Cuenta
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
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
            )}
        </div>
    );
};

export default Accounts;
