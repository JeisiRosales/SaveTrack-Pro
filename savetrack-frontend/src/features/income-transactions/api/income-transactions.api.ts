import api from '@/lib/api';
import { CreateIncomeTransactionForm } from '../types';

/**
 * Recopila todas las entradas (ingresos) asignadas al usuario activo.
 * @returns Colección de transacciones de ingresos `IncomeTransaction[]`
 */
export const getIncomeTransactions = () => api.get('/income-transactions');

/**
 * Ingresa una operación positiva al libro contable. 
 * Si el DTO incluye `perform_auto_save`, backend derivará fondos automáticamente.
 * @param data Registro de la transacción a realizar.
 * @returns El objeto de la base recien insertado.
 */
export const createIncomeTransaction = (data: CreateIncomeTransactionForm) => api.post('/income-transactions', data);

/**
 * Quita una transacción de ingresos de manera permanente usando su identificador.
 * @param id Cadena UUID en el backend
 * @returns Resuelve a un status 200/204
 */
export const deleteIncomeTransaction = (id: string) => api.delete(`/income-transactions/${id}`);
