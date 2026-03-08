import { useState } from 'react';
import * as accountsApi from '../api/accounts.api';
import api from '@/lib/api';
import { Account, EditAccountForm, Transaction } from '../types';

// Hook para manejar los detalles de una cuenta
export const useAccountDetails = (initialAccount: Account | null) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccount);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<EditAccountForm>({ name: '', balance: 0 });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Manejamos la apertura del modal de detalle de cuenta
    const openDetails = async (account: Account) => {
        setSelectedAccount(account);
        setEditForm({ name: account.name, balance: account.balance });
        setIsEditMode(false);
        setShowDeleteConfirm(false);

        try {
            setLoadingTransactions(true);

            // Promesa concurrente para obtener todas las transacciones vinculadas a esta cuenta
            const [goalsTx, incomesTx, expensesTx] = await Promise.all([
                accountsApi.getAccountTransactions(account.id),
                api.get(`/income-transactions?account_id=${account.id}`),
                api.get(`/expense-transactions?account_id=${account.id}`)
            ]);

            // Formatear Metas
            const mappedGoals = (goalsTx.data || []).map((t: any) => ({
                id: t.id,
                created_at: t.created_at,
                amount: t.amount,
                type: t.type, // 'deposit' | 'withdrawal'
                universalType: t.type === 'deposit' ? 'goal_deposit' : 'goal_withdrawal',
                entityName: t.savings_goals?.title || 'Meta Eliminada'
            }));

            // Formatear Ingresos
            const mappedIncomes = (incomesTx.data || [])
                .filter((t: any) => t.account_id === account.id)
                .map((t: any) => ({
                    id: t.id,
                    created_at: t.created_at,
                    amount: t.amount,
                    type: 'deposit',
                    universalType: 'income',
                    entityName: t.description || t.income_categories?.name || 'Ingreso'
                }));

            // Formatear Gastos
            const mappedExpenses = (expensesTx.data || [])
                .filter((t: any) => t.account_id === account.id)
                .map((t: any) => ({
                    id: t.id,
                    created_at: t.created_at,
                    amount: t.amount,
                    type: 'withdrawal',
                    universalType: 'expense',
                    entityName: t.description || t.expense_categories?.name || 'Gasto'
                }));

            // Combinar y ordenar
            const allTransactions = [...mappedGoals, ...mappedIncomes, ...mappedExpenses]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setTransactions(allTransactions);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    // Manejamos la actualización de una cuenta
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

    // Manejamos la eliminación de una cuenta
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
