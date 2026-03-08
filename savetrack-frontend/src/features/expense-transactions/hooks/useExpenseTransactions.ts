import { useState, useEffect, useCallback } from 'react';
import { ExpenseTransaction, CreateExpenseTransactionForm } from '../types';
import { getExpenseTransactions, createExpenseTransaction, deleteExpenseTransaction } from '../api/expense-transactions.api';

/**
 * Hook para la orquestación y administración del historial de Gastos.
 * Maneja el listado completo, inserciones y anulaciones, garantizando su sincronización.
 */
export const useExpenseTransactions = () => {
    const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);

    /**
     * Refresca un listado completo consultando el API del backend.
     */
    const fetch = useCallback(async () => {
        const res = await getExpenseTransactions();
        setTransactions(res.data);
    }, []);

    // Auto-Carga al inicio, ignorando regla de linter por diseño propio
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetch(); }, [fetch]);

    /**
     * Registra un desembolso e inmediatamente vuelve a sincronizar
     * para rehidratar data anexada via joins (eg. nombre de cuenta/categoría)
     * @param data Campos del registro provenientes del formulario modal
     */
    const add = async (data: CreateExpenseTransactionForm) => {
        await createExpenseTransaction(data);
        await fetch(); // Refrescar para obtener joins actualizados
    };

    /**
     * Retira la transacción y filtra agresivamente la colección local
     * optimizando el repintado en la UI sin hacer re-fetch total.
     * @param id Identificador de operación
     */
    const remove = async (id: string) => {
        await deleteExpenseTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    return { transactions, add, remove };
};
