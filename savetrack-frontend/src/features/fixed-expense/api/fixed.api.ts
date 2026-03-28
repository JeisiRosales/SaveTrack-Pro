import api from '@/lib/api';
import { FixedExpense, FixedExpenseSummary } from '../types';

/**
 * Obtiene la lista de compromisos de gastos fijos vinculados al estado de pago mensual.
 */
export const getFixedExpenses = () => api.get<FixedExpense[]>('/fixed-expenses');

/**
 * Obtiene el resumen consolidado de gastos fijos del mes actual.
 */
export const getFixedExpensesSummary = () => api.get<FixedExpenseSummary>('/fixed-expenses/summary');

/**
 * Crea un nuevo compromiso de gasto fijo.
 */
export const createFixedExpense = (data: Partial<FixedExpense>) => api.post('/fixed-expenses', data);

/**
 * Actualiza un compromiso de gasto fijo existente.
 */
export const updateFixedExpense = (id: string, data: Partial<FixedExpense>) => api.patch(`/fixed-expenses/${id}`, data);

/**
 * Elimina un compromiso de gasto fijo.
 */
export const deleteFixedExpense = (id: string) => api.delete(`/fixed-expenses/${id}`);
