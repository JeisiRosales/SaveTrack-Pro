import React, { useState } from 'react';
import { Wallet, Menu, ArrowLeftRight, Loader2, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import CreateAccountModal from '@/features/accounts/components/CreateAccount';
import { useAccounts } from '../hooks/useAccounts';
import { useAccountDetails } from '../hooks/useAccountDetails';
import { AccountCard } from './AccountCard';
import { TransferModal } from './TransferModal';
import { AccountDetailModal } from './AccountDetailModal';
import { Account } from '../types';
import { useGlobalSettings } from '@/context/SettingsContext';
import HeroCard from '@/components/ui/HeroCard';

interface ContextType {
    toggleSidebar: () => void;
}

export const AccountsView: React.FC = () => {
    const { toggleSidebar } = useOutletContext<ContextType>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { currencySymbol, settings } = useGlobalSettings();

    const {
        accounts,
        loading,
        error,
        totalBalance,
        statusMessage,
        isTransferring,
        fetchAccounts,
        handleTransfer,
        handleCloseTransferModal: closeTransferModal, // ← usamos la del hook
    } = useAccounts();

    const accountDetails = useAccountDetails(null);

    // Cierra el modal de transferencia usando el handler del hook
    // que limpia statusMessage con el delay correcto
    const handleCloseTransferModal = () => {
        setIsTransferModalOpen(false);
        closeTransferModal(); // limpia statusMessage tras animación
    };

    const handleOpenDetails = (account: any) => {
        accountDetails.openDetails(account);
        setIsDetailModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden font-black">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-[var(--accent-text)]" />
                        Mis Cuentas
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">
                        Administra tus fuentes de ahorro y saldos.
                    </p>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {error ? (
                <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl border border-rose-200 text-center font-black">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">{error}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <HeroCard
                        label="Saldo Consolidado"
                        amount={`${currencySymbol}${totalBalance.toLocaleString()}`}
                        sublabel={
                            <div className="flex flex-col gap-1">
                                <p className="opacity-90">{accounts.length} cuentas activas</p>
                                <p className="text-[10px] tracking-wider uppercase font-black">Resumen de tus activos financieros</p>
                            </div>
                        }
                        icon={Wallet}
                    >
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setIsTransferModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 shadow-sm"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                                <span>Transferir entre cuentas</span>
                            </button>
                        </div>
                    </HeroCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.length > 0 ? (
                            accounts.map((acc: Account) => (
                                <AccountCard
                                    key={acc.id}
                                    account={acc}
                                    totalBalance={totalBalance}
                                    onClick={() => handleOpenDetails(acc)}
                                    isSavings={acc.id === settings?.savings_account_id}
                                />
                            ))
                        ) : (
                            <div className="col-span-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-12 text-center text-[var(--muted)]">
                                No tienes cuentas registradas. Crea una desde el Dashboard.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAccountCreated={fetchAccounts}
            />

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={handleCloseTransferModal}
                accounts={accounts}
                statusMessage={statusMessage}
                isTransferring={isTransferring}
                onTransfer={handleTransfer}
            />

            <AccountDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                account={accountDetails.selectedAccount}
                isEditMode={accountDetails.isEditMode}
                onEditModeChange={accountDetails.setIsEditMode}
                editForm={accountDetails.editForm}
                onEditFormChange={accountDetails.setEditForm}
                isUpdating={accountDetails.isUpdating}
                onUpdate={() => accountDetails.handleUpdate(fetchAccounts)}
                isDeleting={accountDetails.isDeleting}
                onDelete={() => accountDetails.handleDelete(() => {
                    fetchAccounts();
                    setIsDetailModalOpen(false);
                })}
                showDeleteConfirm={accountDetails.showDeleteConfirm}
                onDeleteConfirmChange={accountDetails.setShowDeleteConfirm}
                transactions={accountDetails.transactions}
                loadingTransactions={accountDetails.loadingTransactions}
            />
        </main>
    );
};