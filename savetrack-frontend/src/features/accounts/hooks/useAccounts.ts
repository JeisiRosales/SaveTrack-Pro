import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as accountsApi from '../api/accounts.api';
import { Account, TransferForm } from '../types';

// Hook para manejar las cuentas con React Query
export const useAccounts = () => {
    const queryClient = useQueryClient();
    const [isTransferring, setIsTransferring] = useState(false);
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | null;
    }>({ text: '', type: null });

    const {
        data: accounts = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchAccounts
    } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await accountsApi.getAccounts();
            return response.data;
        }
    });

    const error = queryError ? "No se pudieron cargar tus cuentas." : null;
    const totalBalance = accounts.reduce((acc: number, curr: Account) => acc + (curr.balance || 0), 0);

    // Esta función es la que pasaremos al prop onClose del modal
    const handleCloseTransferModal = () => {
        setTransferModalOpen(false);

        // Esperamos a que la animación de salida termine (aprox 300ms) 
        // antes de borrar el mensaje, para que no desaparezca bruscamente
        setTimeout(() => {
            setStatusMessage({ text: '', type: null });
        }, 300);
    };

    // Manejamos la transferencia de fondos e invalidamos cachés
    const handleTransfer = async (formData: TransferForm) => {
        setStatusMessage({ text: '', type: null });
        try {
            setIsTransferring(true);
            await accountsApi.transferFunds(formData);

            // Invalidamos las consultas relacionadas para forzar actualización
            await queryClient.invalidateQueries({ queryKey: ['accounts'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

            setStatusMessage({ text: '¡Transferencia realizada con éxito!', type: 'success' });
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
        isTransferModalOpen,
        fetchAccounts,
        handleTransfer,
        setStatusMessage,
        handleCloseTransferModal
    };
};
