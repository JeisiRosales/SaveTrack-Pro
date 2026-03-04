import { useState, useEffect } from 'react';
import * as accountsApi from '../api/accounts.api';
import { Account, TransferForm } from '../types';

export const useAccounts = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | null;
    }>({ text: '', type: null });
    const [isTransferring, setIsTransferring] = useState(false);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await accountsApi.getAccounts();
            setAccounts(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching accounts:", err);
            setError("No se pudieron cargar tus cuentas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

    const handleTransfer = async (formData: TransferForm) => {
        setStatusMessage({ text: '', type: null });
        try {
            setIsTransferring(true);
            await accountsApi.transferFunds(formData);
            setStatusMessage({ text: '¡Transferencia realizada con éxito!', type: 'success' });
            await fetchAccounts();
            return true;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al procesar la transferencia';
            setStatusMessage({ text: errorMsg, type: 'error' });
            return false;
        } finally {
            setIsTransferring(false);
        }
    };

    return {
        accounts,
        loading,
        error,
        totalBalance,
        statusMessage,
        isTransferring,
        fetchAccounts,
        handleTransfer,
        setStatusMessage
    };
};
