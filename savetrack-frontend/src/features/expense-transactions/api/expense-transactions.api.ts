import api from '@/lib/api';
import { CreateExpenseTransactionForm } from '../types';

/**
 * Obtiene el historial exhaustivo de transacciones de gastos para el usuario autenticado.
 * @returns Promesa resolviendo al arreglo de transacciones (`ExpenseTransaction`)
 */
export const getExpenseTransactions = () => api.get('/expense-transactions');

/**
 * Registra un nuevo gasto deduciendo del saldo según el payload.
 * @param data Objeto contenedor de los parámetros de creación
 * @returns Promesa con los detalles insertados de la transacción
 */
export const createExpenseTransaction = (data: CreateExpenseTransactionForm) => api.post('/expense-transactions', data);

/**
 * Anula y elimina un gasto específico restaurando retroactivamente saldos impactados (si se requiriese por backend).
 * @param id Identificador UUID de la transacción
 * @returns Promesa resolviendo a la anulación de la transacción
 */
export const deleteExpenseTransaction = (id: string) => api.delete(`/expense-transactions/${id}`);
