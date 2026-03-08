import { useState, useEffect, useCallback } from 'react';
import { IncomeTransaction, CreateIncomeTransactionForm } from '../types';
import { getIncomeTransactions, createIncomeTransaction, deleteIncomeTransaction } from '../api/income-transactions.api';

/**
 * Controlador de lógica de Estado para Transacciones de Ingreso.
 * Conecta los modales y las vistas de tabla con las API de Supabase vía nuestro backend.
 */
export const useIncomeTransactions = () => {
    const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);

    /**
     * Reabastece el estado extrayendo todas las interacciones de entrada.
     */
    const fetch = useCallback(async () => {
        const res = await getIncomeTransactions();
        setTransactions(res.data);
    }, []);

    // Efecto de inicialización inmediata (Auto Fetch)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetch(); }, [fetch]);

    /**
     * Genera un Ingreso y luego obliga a la tabla a recargar sus dependencias,
     * obteniendo detalles unidos como el nombre de categoría asignado.
     * @param data Los campos completados en la UI
     */
    const add = async (data: CreateIncomeTransactionForm) => {
        await createIncomeTransaction(data);
        await fetch(); // Refrescar para obtener joins
    };

    /**
     * Descarta la transacción contable por ID y limpia la caché local
     * forzando re-render al evitar un segundo llamado al servidor.
     * @param id ID interno de Supabase
     */
    const remove = async (id: string) => {
        await deleteIncomeTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    return { transactions, add, remove };
};
