import api from '@/lib/api';
import { CreateExpenseCategoryForm } from '../../expense/types';

/**
 * Obtiene todas las categorías de gastos registradas por el usuario.
 * @returns Promesa con la respuesta de la API que incluye un arreglo de `ExpenseCategory`
 */
export const getExpenseCategories = () => api.get('/expense-categories');

/**
 * Crea una nueva categoría de gastos.
 * @param data Objeto con la información de la categoría a crear
 * @returns Promesa con la respuesta de la API incluyendo la categoría creada
 */
export const createExpenseCategory = (data: CreateExpenseCategoryForm) => api.post('/expense-categories', data);

/**
 * Elimina de manera permanente una categoría de gasto.
 * @param id Identificador único de la categoría a eliminar
 * @returns Promesa resolviendo tras una eliminación exitosa
 */
export const deleteExpenseCategory = (id: string) => api.delete(`/expense-categories/${id}`);

export const updateExpenseCategory = (id: string, data: Partial<CreateExpenseCategoryForm>) => api.patch(`/expense-categories/${id}`, data);
