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
    Plus
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-indigo-600" />
                            Mis Cuentas
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Administra tus fuentes de ahorro y saldos.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Resumen Global */}
                        <div className="bg-indigo-50/40 p-6 lg:p-8 rounded-2xl border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Saldo Consolidado</h2>
                                <h3 className="text-3xl font-bold mt-2 text-indigo-600">
                                    ${totalBalance.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                <span className="text-indigo-600 font-bold">{accounts.length}</span> cuentas activas
                            </div>
                        </div>

                        {/* Grid de Cuentas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accounts.length > 0 ? (
                                accounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => handleOpenDetails(acc)}
                                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                                    {totalBalance > 0 ? `${Math.round((acc.balance / totalBalance) * 100)}%` : '0%'}
                                                </span>
                                            </div>
                                            <h5 className="text-sm font-bold text-slate-900 leading-tight mb-1">{acc.name}</h5>
                                            <p className="text-xl font-bold text-indigo-600">${acc.balance.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Toca para ver detalles</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-[2rem] p-12 text-center text-[var(--muted)]">
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

                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="max-h-[85vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isEditMode ? 'Editar Cuenta' : 'Información de Cuenta'}
                                </h3>
                                {!isUpdating && !isDeleting && (
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {isEditMode ? (
                                <form onSubmit={handleUpdateAccount} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre de la Cuenta</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Saldo Actual ($)</label>
                                        <input
                                            type="number"
                                            value={editForm.balance}
                                            onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditMode(false)}
                                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm"
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
                                    <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-50/50">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Saldo Disponible</p>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            ${selectedAccount.balance.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-4 px-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--muted)] flex items-center gap-2"><Clock className="w-4 h-4" /> Creado el</span>
                                            <span className="font-bold text-gray-900">{new Date(selectedAccount.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--muted)] flex items-center gap-2"><Wallet className="w-4 h-4" /> Nombre</span>
                                            <span className="font-bold text-gray-900">{selectedAccount.name}</span>
                                        </div>
                                    </div>

                                    {/* Historial de Transacciones */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-400" />
                                            Historial Reciente
                                        </h4>
                                        {loadingTransactions ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                                            </div>
                                        ) : transactions.length > 0 ? (
                                            <div className="space-y-3">
                                                {transactions.slice(0, 5).map(tx => (
                                                    <div key={tx.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                                                <Plus className={`w-4 h-4 ${tx.type !== 'deposit' && 'rotate-45'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 capitalize">{tx.type === 'deposit' ? 'Depósito' : 'Retiro'}</p>
                                                                <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className={`text-xs font-black ${tx.type === 'deposit' ? 'text-indigo-600' : 'text-red-600'}`}>
                                                            {tx.type === 'deposit' ? '-' : '+'}${tx.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[var(--muted)] text-center py-4 italic">No hay movimientos registrados.</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
                                        {showDeleteConfirm ? (
                                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-bottom-2 duration-300">
                                                <p className="text-xs font-bold text-red-600 mb-3 text-center">¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.</p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="flex-1 py-3 bg-white text-gray-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-50 transition-colors"
                                                    >
                                                        No, cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        disabled={isDeleting}
                                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center"
                                                    >
                                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setIsEditMode(true)}
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-50 text-[var(--color-primary)] rounded-2xl font-bold hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" /> Editar Cuenta
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="w-full flex items-center justify-center gap-2 py-4 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-colors"
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
