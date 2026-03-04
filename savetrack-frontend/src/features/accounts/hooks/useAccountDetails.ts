import { useState } from 'react';
import * as accountsApi from '../api/accounts.api';
import { Account, EditAccountForm, Transaction } from '../types';

export const useAccountDetails = (initialAccount: Account | null) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccount);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<EditAccountForm>({ name: '', balance: 0 });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    const openDetails = async (account: Account) => {
        setSelectedAccount(account);
        setEditForm({ name: account.name, balance: account.balance });
        setIsEditMode(false);
        setShowDeleteConfirm(false);

        try {
            setLoadingTransactions(true);
            const response = await accountsApi.getAccountTransactions(account.id);
            setTransactions(response.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleUpdate = async (onSuccess: () => void) => {
        if (!selectedAccount) return;
        try {
            setIsUpdating(true);
            await accountsApi.updateAccount(selectedAccount.id, editForm);
            setSelectedAccount({ ...selectedAccount, ...editForm });
            setIsEditMode(false);
            onSuccess();
        } catch (err) {
            console.error("Error updating account:", err);
            alert("No se pudo actualizar la cuenta.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (onSuccess: () => void) => {
        if (!selectedAccount) return;
        try {
            setIsDeleting(true);
            await accountsApi.deleteAccount(selectedAccount.id);
            onSuccess();
        } catch (err) {
            console.error("Error deleting account:", err);
            alert("No se pudo eliminar la cuenta.");
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        selectedAccount,
        isEditMode,
        editForm,
        isUpdating,
        isDeleting,
        showDeleteConfirm,
        transactions,
        loadingTransactions,
        setSelectedAccount,
        setIsEditMode,
        setEditForm,
        setShowDeleteConfirm,
        openDetails,
        handleUpdate,
        handleDelete
    };
};
